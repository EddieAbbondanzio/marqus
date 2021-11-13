import { useEffect } from "react";
import { RequireOne } from "../../shared/utils/types";
import { findParent } from "./findParent";

export const FOCUSABLE_ID_ATTRIBUTE = "data-focusable-id";

export interface Focusable {
  el: HTMLElement;
  id: string;
  name?: string;
}

export type IsFocused = (
  opts: RequireOne<Focusable, "id" | "name">,
  checkChildren?: boolean
) => boolean;

let focusables: Focusable[] = [];
let active: Focusable | undefined;
let enabled: boolean = false;

/**
 * Enable tracking user focus. Should be called in the root component.
 */
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

  // isFocused shim
  return () => false;
}

/**
 * Register a focusable that should be tracked.
 * @param focusable Focusable element to register.
 */
export function registerFocusable(focusable: Focusable) {
  const existing = focusables.find((f) => f.el === focusable.el);

  // Prevent duplicates
  if (existing != null) {
    return;
  }

  focusables.push(focusable);
}

/**
 * Stop tracking a focusable element.
 * @param focusable Focusable to no longer track.
 */
export function removeFocusable(focusable: Focusable) {
  const index = focusables.findIndex((f) => f.el === focusable.el);

  if (index !== -1) {
    focusables.splice(index, 1);
  }
}

/**
 * Check to see if a focusable element currently has user focus.
 * @param opts id or name of the focusable.
 * @param checkChildren If we should consider a
 * focusable focused when a child focusable is focused.
 * @returns True if the active focusable matches.
 */
export function isFocused(
  opts: RequireOne<Focusable, "id" | "name">,
  checkChildren: boolean = false
) {
  const focusable = findFocusable(opts);

  if (focusable === active) {
    return true;
  } else if (checkChildren) {
    throw Error("Not implemented.");
  } else {
    return false;
  }
}

/**
 * Focus user input into a focusable element.
 * @param opts id or name of the focusable.
 */
export function focus(opts: RequireOne<Focusable, "id" | "name">) {
  const focusable = findFocusable(opts);
  focusable.el.focus();
}

/**
 * Find a focusable by id or name. Throws if none found.
 * @param opts id or name of the focusable.
 * @returns The matching focusable.
 */
function findFocusable(opts: RequireOne<Focusable, "id" | "name">): Focusable {
  let focusable: Focusable | undefined;

  if (opts.id != null) {
    focusable = focusables.find((f) => opts.id === f.id);

    if (focusables == null) {
      throw Error(`No focusable with id ${opts.id} found.`);
    }
  } else {
    focusable = focusables.find((f) => opts.name === f.name);

    if (focusables == null) {
      throw Error(`No focusable with name ${opts.name} found.`);
    }
  }

  return focusable!;
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
