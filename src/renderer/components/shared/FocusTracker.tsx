import React, {
  createContext,
  PropsWithChildren,
  useState,
  useEffect,
} from "react";
import { Section } from "../../store/state";
import { Store, StoreListener } from "../../store";
import { isEmpty } from "lodash";

export type FocusSubscriber = (event: "focus" | "blur") => void;

export const FocusContext = createContext<{
  push(name: string, overwrite?: boolean): void;
  pop(): void;
  subscribe(name: string, subscriber: FocusSubscriber): void;
  unsubscribe(name: string): void;
}>({} as any);

export interface FocusTrackerProps {
  className?: string;
  store: Store;
}

export interface FocusTrackerState {
  subscribers: Partial<Record<Section, FocusSubscriber>>;
  previous?: Section;
}

export function FocusTracker({
  store,
  children,
  className,
}: PropsWithChildren<FocusTrackerProps>) {
  const [state, setState] = useState<FocusTrackerState>({
    subscribers: {},
    // Other props get defined as it's used.
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

  useEffect(() => {
    const { focused } = store.state.ui;
    if (isEmpty(focused)) {
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
  }, [store.state.ui.focused, state.previous, state.subscribers]);

  useEffect(() => {
    store.on("focus.push", pushSection);
    store.on("focus.pop", popSection);

    return () => {
      store.off("focus.push", pushSection);
      store.off("focus.pop", popSection);
    };
  }, [store.state]);

  const push = (name: Section) => store.dispatch("focus.push", name);
  const pop = () => store.dispatch("focus.pop");

  return (
    <FocusContext.Provider value={{ push, pop, subscribe, unsubscribe }}>
      <div className={className}>{children}</div>
    </FocusContext.Provider>
  );
}

const pushSection: StoreListener<"focus.push"> = (ev, ctx) => {
  ctx.setUI((s) => {
    const focused = [ev.value];
    if (s.focused != null && s.focused[0] !== ev.value) {
      focused.push(s.focused[0]);
    }

    return {
      focused,
    };
  });
};

const popSection: StoreListener<"focus.pop"> = (ev, ctx) => {
  ctx.setUI((s) => {
    if (isEmpty(s.focused)) {
      return s;
    }

    return {
      focused: [],
    };
  });
};
