import React, {
  createContext,
  PropsWithChildren,
  useState,
  useEffect,
} from "react";
import { Section } from "../../store/state";
import { Store, StoreListener, useStore } from "../../store";
import { head, isEmpty } from "lodash";

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

export function FocusTracker({
  store,
  children,
  className,
}: PropsWithChildren<FocusTrackerProps>) {
  const [subscribers, setSubscribers] = useState<
    Partial<Record<Section, FocusSubscriber>>
  >({});

  /*
   * Notify subscribers if focused section has changed. We keep track of who
   * we've last notified to ensure we don't create infinite render loops
   * due to el.focus() re triggering the cycle.
   */
  const [previous, setPrevious] = useState<Section | undefined>(undefined);
  useEffect(() => {
    const curr = head(store.state.ui.focused);
    if (previous != null && curr == previous) {
      return;
    }

    /*
     * We can't call this within setState() or else React throws a render error
     * due to things changing while it's in the middle of rendering.
     *
     * Order is also important here. We want blur to fire before focus because
     * these will most call .blur() and .focus() on HTML elements.
     */
    if (previous != null) {
      const previousSub = subscribers[previous];
      previousSub?.("blur");
    }

    const currSub = subscribers[curr!];
    currSub?.("focus");
    setPrevious(curr);
  }, [store.state.ui.focused, previous]);

  const subscribe = (name: Section, subscriber: FocusSubscriber) => {
    setSubscribers((s) => ({
      ...s,
      [name]: subscriber,
    }));
  };

  const unsubscribe = (name: Section) => {
    setSubscribers((s) => ({
      ...s,
      [name]: undefined,
    }));
  };

  const pushSection: StoreListener<"focus.push"> = ({ value: next }, ctx) => {
    let previous: Section | undefined;
    let wasSame = false;

    ctx.setUI((s) => {
      const focused = [next];

      if (s.focused == focused) {
        wasSame = true;
        return s;
      }

      if (s.focused != null && s.focused !== focused) {
        previous = head(s.focused)!;
        focused.push(previous);
      }

      return {
        focused,
      };
    });

    if (wasSame) {
      return;
    }
  };

  const popSection: StoreListener<"focus.pop"> = (_, ctx) => {
    let previous: Section | undefined;
    ctx.setUI((s) => {
      if (isEmpty(s.focused)) {
        return s;
      }

      previous = head(s.focused);
      return {
        focused: [],
      };
    });

    /*
     * We can't call this within setState() or else React throws a render error
     * due to things changing while it's in the middle of rendering.
     */
    if (previous != null) {
      const sub = subscribers[previous];
      sub?.("blur");
    }
  };

  useEffect(() => {
    store.on("focus.push", pushSection);
    store.on("focus.pop", popSection);

    return () => {
      store.off("focus.push", pushSection);
      store.off("focus.pop", popSection);
    };
  }, [store.state, subscribers]);

  const push = (name: Section) => store.dispatch("focus.push", name);
  const pop = () => store.dispatch("focus.pop");

  return (
    <FocusContext.Provider value={{ push, pop, subscribe, unsubscribe }}>
      <div className={className}>{children}</div>
    </FocusContext.Provider>
  );
}
