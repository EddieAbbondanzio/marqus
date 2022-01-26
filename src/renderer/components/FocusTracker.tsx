import { initial } from "lodash";
import React, {
  createContext,
  PropsWithChildren,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { Nullable } from "tsdef";
import { UI, Section, State } from "../../shared/domain/state";
import { KeyCode } from "../../shared/io/keyCode";
import { SetUI } from "../io/commands/types";
import { useKeyboard } from "../io/keyboard";

export type FocusSubscriber = (event: "focus" | "blur") => void;

export const FocusContext = createContext<{
  push(name: string, overwrite?: boolean): void;
  pop(): void;
  subscribe(name: string, subscriber: FocusSubscriber): void;
  unsubscribe(name: string): void;
}>({} as any);

export interface FocusTrackerProps {
  className?: string;
  state: State;
  setUI: SetUI;
}

export interface FocusTrackerState {
  subscribers: Partial<Record<Section, FocusSubscriber>>;
  previous?: Section;
}

export function FocusTracker(props: PropsWithChildren<FocusTrackerProps>) {
  const [state, setState] = useState<FocusTrackerState>({
    subscribers: {},
  });

  const subscribe = (name: Section, subscriber: FocusSubscriber) => {
    setState((s) => ({
      ...s,
      subscribers: {
        ...s.subscribers,
        [name]: subscriber,
      },
    }));
  };

  const unsubscribe = (name: Section) => {
    setState((s) => ({
      ...s,
      subscribers: {
        ...s.subscribers,
        [name]: undefined,
      },
    }));
  };

  const push = (name: Section, overwrite: boolean) => {
    props.setUI((s) => {
      const focused = [name];
      if (!overwrite && s.focused != null && s.focused[0] !== name) {
        focused.push(s.focused[0]);
      }

      return {
        focused,
      };
    });
  };

  const pop = () => {
    props.setUI((s) => {
      if (s.focused == null || s.focused.length === 0) {
        return s;
      }

      return {
        focused: [],
      };
    });
  };

  useEffect(() => {
    const { focused } = props.state.ui;
    if (focused == null || focused.length === 0) {
      setState((s) => ({
        ...s,
        previous: undefined,
      }));
      return;
    }

    /*
     * Detect if we need to notify a focusable. This will handle notifying of
     * externally made changes too (like from setUI).
     */
    const [curr] = focused.slice(0);
    const { previous } = state;
    if (previous != curr) {
      if (curr != null) {
        if (previous != null) {
          const prevSub = state.subscribers[previous];
          prevSub?.("blur");
        }

        const currSub = state.subscribers[curr];
        if (currSub != null) {
          currSub("focus");

          // We only set state if sub was notified to prevent an infinite loop.
          setState((s) => ({
            ...s,
            previous: curr,
          }));
        }
      }
    }
  }, [props.state.ui.focused, state.previous, state.subscribers]);

  return (
    <FocusContext.Provider value={{ push, pop, subscribe, unsubscribe }}>
      <div className={props.className}>{props.children}</div>
    </FocusContext.Provider>
  );
}
