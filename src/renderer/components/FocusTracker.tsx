import React, {
  createContext,
  PropsWithChildren,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { UISection, State } from "../../shared/domain/state";
import { SetUI } from "../io/commands/types";

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
    if (ref.current == null) {
      throw Error(`Cannot focus null ref`);
    }

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

      const [, ...focused] = s.focused;
      return {
        focused,
      };
    });
  };

  useEffect(() => {
    const curr = props.state.ui.focused?.[0];
    if (state.previous != curr) {
      if (curr != null) {
        const sub = state.subscribers[curr];

        if (sub != null) {
          sub();
        }
      }

      setState((s) => ({
        ...s,
        previous: curr,
      }));
    }
  });

  return (
    <FocusContext.Provider value={{ push, pop, subscribe, unsubscribe }}>
      <div className={props.className}>{props.children}</div>
    </FocusContext.Provider>
  );
}
