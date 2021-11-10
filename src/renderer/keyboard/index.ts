import { useEffect } from "react";
import { KeyCode, parseKey } from "./keyCode";

let activeKeys: Record<string, boolean | undefined> | undefined;

/**
 * Check if a specific key is currently active.
 * @param key The key to check for.
 * @returns True if the user currently has the key pressed.
 */
export function isKeyDown(key: KeyCode): boolean {
  if (activeKeys == null) {
    throw Error("Not listening for keys");
  }

  return activeKeys[key] ?? false;
}

/**
 * Hook to listen for keys being pressed / released.
 * Should only be called once in the root React component.
 */
export function useKeyboard() {
  if (activeKeys != null) {
    throw Error(`useKeyboard() was already called. Cannot listen twice.`);
  }

  activeKeys = {};

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);

      activeKeys = undefined;
    };
  });
}

function onKeyDown(e: KeyboardEvent) {
  const key = parseKey(e.code);

  // Disable default arrow key actions
  if (
    key === KeyCode.ArrowLeft ||
    key === KeyCode.ArrowRight ||
    key === KeyCode.ArrowUp ||
    key === KeyCode.ArrowDown ||
    key === KeyCode.Tab
  ) {
    e.preventDefault();
  }

  /*
   * Prevent duplicate triggers from firing when keys with multiples
   * such as control (left side, right side) are pressed.
   */
  if (isKeyDown(key)) {
    return;
  }

  // Flag key as active
  activeKeys![key] = true;

  //   const maps = this.state.map[this.getters.activeKeyString];

  //   if (maps == null || maps.length === 0) {
  //     return;
  //   }

  //   for (const { command, context } of maps) {
  // if (context == null || contexts.isFocused(context)) {
  //   commands.run(command as unknown as any, undefined);
  // }
  //   }
}

function onKeyUp(e: KeyboardEvent) {
  const key = parseKey(e.code);

  // Remove key flag
  delete activeKeys![key];
}
