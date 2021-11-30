import { isEqual, chain } from "lodash";
import { useEffect, useState } from "react";
import { State } from "../../shared/domain";
import { parseKeyCode, KeyCode, sortKeyCodes } from "../../shared/io/keyCode";
import { sleep } from "../../shared/utils/sleep";
import { CommandName, Execute } from "../commands";
import { IsFocused } from "../components/shared/Focusable";

export function useShortcuts(
  state: State,
  execute: Execute,
  isFocused: IsFocused
) {
  const [shortcuts] = useState(state.shortcuts.values);

  useEffect(
    () => {
      const keyTracker: Record<string, boolean | undefined> = {};
      let interval: NodeJS.Timer;

      const keyDown = (ev: KeyboardEvent) => {
        /*
         * Disable all default shortcuts. This does require us to re-implement
         * everything but this gives the user a chance to redefine or disable any
         * shortcut.
         */
        ev.preventDefault();

        // Prevent redundant calls
        if (!ev.repeat) {
          const key = parseKeyCode(ev.code);
          keyTracker[key] = true;

          const activeKeys = toKeyArray(keyTracker);
          const shortcut = shortcuts.find(
            (s) =>
              isEqual(s.keys, activeKeys) &&
              !s.disabled &&
              (s.when == null || isFocused(s.when))
          );

          if (shortcut != null) {
            void execute(shortcut.command as CommandName, undefined!);

            if (shortcut.repeat) {
              (async () => {
                await sleep(250);
                const currKeys = toKeyArray(keyTracker);

                if (isEqual(currKeys, activeKeys)) {
                  interval = setInterval(() => {
                    void execute(shortcut.command as CommandName, undefined!);
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
    },
    // No dependencies so it's only called on component mount and unmount
    []
  );
}

export const toKeyArray = (
  activeKeys: Record<string, boolean | undefined>
): KeyCode[] =>
  chain(activeKeys)
    .entries()
    .filter(([, active]) => active === true)
    .map(([key]) => key as KeyCode)
    .tap(sortKeyCodes)
    .value();
