import { useEffect } from "react";
import { KeyCode, parseKey } from "./keyCode";

let activeKeys: Record<string, boolean> = {};

export function isKeyDown(key: KeyCode): boolean {
  return activeKeys[key] ?? false;
}

export function useKeyboard() {
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
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
  activeKeys[key] = true;
  console.log("key down: ", key);

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

  console.log("key up: ", key);

  // Remove active key
  delete activeKeys[key];
}
