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
import { UISection, State } from "../../shared/domain/state";
import { KeyCode } from "../../shared/io/keyCode";
import { SetUI } from "../io/commands/types";
import { useKeyboard } from "../io/keyboard";

export const FocusContext = createContext<{
  push(name: UISection, ref: RefObject<HTMLElement>, overwrite?: boolean): void;
  pop(): void;
  subscribe(name: UISection, subscriber: () => void): void;
  unsubscribe(name: UISection): void;
}>({} as any);

export interface FocusTrackerProps {
  className?: string;
  state: State;
  setUI: SetUI;
}

export interface FocusTrackerState {
  subscribers: Partial<Record<UISection, () => void>>;
  previous?: UISection;
}

export function FocusTracker(props: PropsWithChildren<FocusTrackerProps>) {
  const [state, setState] = useState<FocusTrackerState>({
    subscribers: {},
  });

  const subscribe = (name: UISection, subscriber: () => void) => {
    if (state.subscribers[name] != null) {
      console.warn(`Subscriber for ${name} already exists`, state.subscribers);
      throw Error(`Subscriber for ${name} already exists.`);
    }

    setState((s) => ({
      ...s,
      subscribers: {
        ...s.subscribers,
        [name]: subscriber,
      },
    }));
  };

  const unsubscribe = (name: UISection) => {
    setState((s) => ({
      ...s,
      subscribers: {
        ...s.subscribers,
        [name]: undefined,
      },
    }));
  };

  const push = (
    name: UISection,
    ref: RefObject<HTMLElement>,
    overwrite: boolean
  ) => {
    console.log("push", name);
    if (ref.current == null) {
      throw Error(`Cannot focus null ref`);
    }

    props.setUI((s) => {
      const focused = [name];
      if (!overwrite && s.focused != null && s.focused[0] !== name) {
        focused.push(s.focused[0]);
      }

      console.log("setUI focused: ", focused);
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
    console.log("pop ");
  };

  useEffect(() => {
    const focused = props.state.ui.focused;
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
    const [curr] = focused.slice(-1);
    if (state.previous != curr) {
      if (curr != null) {
        const sub = state.subscribers[curr];

        if (sub != null) {
          console.log("FocusTracker.notify()", curr);
          sub();
        }
      }

      setState((s) => ({
        ...s,
        previous: curr,
      }));
    }
  }, [props.state.ui]);

  return (
    <FocusContext.Provider value={{ push, pop, subscribe, unsubscribe }}>
      <div className={props.className}>{props.children}</div>
    </FocusContext.Provider>
  );
}
