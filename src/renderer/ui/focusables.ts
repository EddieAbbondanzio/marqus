import { useEffect } from "react";
import { findParent } from "./findParent";

export const FOCUSABLE_ID_ATTRIBUTE = "data-focusable-id";

export interface Focusable {
  el: HTMLElement;
  id: string;
  name?: string;
}

let focusables: Focusable[] = [];
let active: Focusable | undefined;
let enabled: boolean = false;

export function useFocusables() {
  useEffect(() => {
    if (enabled) {
      throw Error("Do not call useFocusables() more than once.");
    }

    window.addEventListener("focusin", onFocusIn);
    enabled = true;

    return () => {
      window.removeEventListener("focusin", onFocusIn);
      enabled = false;
    };
  });
}

export function registerFocusable(focusable: Focusable) {
  const existing = focusables.find((f) => f.el === focusable.el);

  // Prevent duplicates
  if (existing != null) {
    return;
  }

  focusables.push(focusable);
}

export function removeFocusable(focusable: Focusable) {
  const index = focusables.findIndex((f) => f.el === focusable.el);

  if (index !== -1) {
    focusables.splice(index, 1);
  }
}

export function isFocused(focusable: Focusable | string) {
  const f =
    typeof focusable === "string"
      ? focusables.find((f) => f.name === focusable)
      : focusable;

  if (f == null) {
    throw Error(`No focusable found`);
  }

  if (f === active) {
    return true;
  } else {
    return false;
  }
}

/**
 * Event handler that determines if a new scope was focused.
 * @param event Event to handle.
 */
function onFocusIn(event: FocusEvent) {
  // We might need to climb up the dom tree to handle nested children of a scope.
  const scopeEl = findParent(
    event.target as HTMLElement,
    (el) => el.hasAttribute(FOCUSABLE_ID_ATTRIBUTE),
    { matchValue: (el) => el }
  );

  console.log(event);
  if (scopeEl == null) {
    active = undefined;
    return;
  }

  const id = scopeEl.getAttribute(FOCUSABLE_ID_ATTRIBUTE)!;
  active = focusables.find((f) => f.id === id)!;
}
