import { isEqual, chain } from "lodash";
import { RefObject, useEffect, useState } from "react";
import { Shortcut, State } from "../../shared/state";
import { parseKeyCode, KeyCode, sortKeyCodes } from "../../shared/io/keyCode";
import { sleep } from "../../shared/sleep";
import { CommandType } from "./commands/types";
import { Execute } from "./commands";

export function useShortcuts(state: State, execute: Execute) {
  const { shortcuts } = state;

  if (shortcuts.length === 0) {
    console.warn("No shortcuts passed to useShortcuts() hook.");
  }

  useEffect(() => {
    const keyTracker: Record<string, boolean | undefined> = {};
    let interval: NodeJS.Timer;

    const keyDown = (ev: KeyboardEvent) => {
      /*
       * Disable all default shortcuts. This does require us to re-implement
       * everything but this gives the user a chance to redefine or disable any
       * shortcut.
       */
      if ((ev.target as HTMLElement).tagName !== "INPUT") {
        ev.preventDefault();
      }

      // Prevent redundant calls
      if (!ev.repeat) {
        const key = parseKeyCode(ev.code);
        keyTracker[key] = true;

        const activeKeys = toKeyArray(keyTracker);
        const shortcut = shortcuts.find(
          (s) =>
            isEqual(s.keys, activeKeys) &&
            !s.disabled &&
            isFocused(state, s.when)
        );

        if (shortcut != null) {
          void execute(shortcut.command as CommandType, undefined!);

          if (shortcut.repeat) {
            (async () => {
              /*
               * First pause is twice as long to ensure a user really
               * wants it to repeat (IE hold to continue scrolling down)
               * vs just being a false negative.
               */
              await sleep(250);
              const currKeys = toKeyArray(keyTracker);

              if (isEqual(currKeys, activeKeys)) {
                interval = setInterval(() => {
                  void execute(shortcut.command as CommandType, undefined!);
                }, 125);
              }
            })();
          }
        }
      }
    };

    const keyUp = ({ code }: KeyboardEvent) => {
      const key = parseKeyCode(code);
      delete keyTracker[key];

      if (interval != null) {
        clearInterval(interval);
      }
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [shortcuts, execute]);
}

export function isFocused(state: State, when?: string): boolean {
  if (state.ui.focused == null) {
    return when == null;
  } else if (when == null) {
    return true;
  } else {
    return when === state.ui.focused;
  }
}

export const toKeyArray = (
  activeKeys: Record<string, boolean | undefined>
): KeyCode[] =>
  chain(activeKeys)
    .entries()
    .filter(([, active]) => active == true)
    .map(([key]) => key as KeyCode)
    .thru(sortKeyCodes)
    .value();
