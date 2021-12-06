import { useEffect } from "react";
import { State, UISection } from "../../shared/state";
import { FOCUSABLE_ATTRIBUTE, IsFocused } from "../components/shared/Focusable";
import { findParent } from "../utils/findParent";
import { SetUI } from "./commands";

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

    const { ui } = state;
    console.log("focus: ", focused);
    setUI({
      ...ui,
      focused: focused ?? undefined,
    });
  }

  return ((section: UISection) => state.ui.focused === section) as IsFocused;
}
