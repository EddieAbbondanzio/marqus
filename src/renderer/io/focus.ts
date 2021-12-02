import { useEffect } from "react";
import { State, UISection } from "../../shared/state";
import { SaveState } from "../App";
import { FOCUSABLE_ATTRIBUTE, IsFocused } from "../components/shared/Focusable";
import { findParent } from "../ui/findParent";

export function useFocus(state: State, saveState: SaveState) {
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
    saveState({
      ...state,
      ui: { ...ui, focused: focused == null ? undefined : focused },
    });
  }

  return ((section: UISection) => state.ui.focused === section) as IsFocused;
}
