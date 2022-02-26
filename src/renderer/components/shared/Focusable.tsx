import { head } from "lodash";
import React, { PropsWithChildren, useEffect, useRef } from "react";
import { Section } from "../../state";
import { Store } from "../../store";
import { findParent } from "../../utils/findParent";

export const FOCUSABLE_ATTRIBUTE = "data-focusable";

export const useFocusTracking = (store: Store) => {
  /*
   * We centralize this for good reason. By only keeping one listener that
   * handles every event we can ensure we don't accidentally push new focusables
   * as the event propagates up due to how events naturally like to bubble.
   */
  const onClick = (ev: MouseEvent) => {
    console.log("ON CLICK WAS CALLED");
    const focusable = findParent(
      ev.target as HTMLElement,
      (el) => el.hasAttribute(FOCUSABLE_ATTRIBUTE),
      { matchValue: (el) => el.getAttribute(FOCUSABLE_ATTRIBUTE) as Section }
    );

    if (focusable != null) {
      const current = head(store.state.ui.focused);
      if (current != null && focusable === current) {
        return;
      }

      console.log("PUSH!");
      store.dispatch("focus.push", focusable);
    } else {
      console.log("NO MATCH!");
    }
  };

  useEffect(() => {
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  });
};
export interface FocusableProps {
  store: Store;
  name: Section;
  className?: string;
  overwrite?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  tabIndex?: number;
}

export function Focusable(props: PropsWithChildren<FocusableProps>) {
  const ref = useRef(null! as HTMLDivElement);
  useEffect(() => {
    const curr = head(props.store.state.ui.focused);

    if (curr == null || curr !== props.name) {
      ref.current.blur();
      props.onBlur?.();
    } else if (curr == props.name) {
      ref.current.focus();
      props.onFocus?.();
    }
  }, [props.store.state.ui.focused, props.onFocus, props.onBlur]);

  return (
    <div
      ref={ref}
      className={props.className}
      tabIndex={props.tabIndex ?? -1}
      {...{ [FOCUSABLE_ATTRIBUTE]: props.name }}
    >
      {props.children}
    </div>
  );
}
