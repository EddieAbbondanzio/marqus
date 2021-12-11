import { RefObject, useEffect, useState } from "react";
import { State, UISection } from "../../shared/state";
import { FOCUSABLE_ATTRIBUTE, IsFocused } from "../components/shared/Focusable";
import { findParent } from "../utils/findParent";
import { SetUI } from "./commands/types";

/**
 * Focus an element once.
 * @param ref The element to focus on render.
 */
export function useFocus(ref: RefObject<HTMLElement>) {
  const [wasFocused, setWasFocused] = useState(false);

  useEffect(() => {
    const { current: el } = ref;

    if (el != null && !wasFocused) {
      el.focus();
      console.log("FOCUS");
      setWasFocused(true);
    }
  });
}

export function useFocusTracking(state: State, setUI: SetUI) {
  useEffect(() => {
    window.addEventListener("focusin", onFocusIn);

    return () => {
      window.removeEventListener("focusin", onFocusIn);
    };
  });

  function onFocusIn(event: FocusEvent) {
    // We might need to climb up the dom tree to handle nested children of a scope.
    const focused = findParent(
      event.target as HTMLElement,
      (el) => el.hasAttribute(FOCUSABLE_ATTRIBUTE),
      {
        matchValue: (el) => el.getAttribute(FOCUSABLE_ATTRIBUTE),
        defaultValue: undefined,
      }
    );

    setUI((ui) => ({
      ...ui,
      focused: focused ?? undefined,
    }));
  }

  return ((section: UISection) => state.ui.focused === section) as IsFocused;
}
