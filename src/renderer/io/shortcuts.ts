import { isEqual, chain } from "lodash";
import { RefObject, useEffect, useState } from "react";
import { Section, State, UI } from "../store/state";
import { parseKeyCode, KeyCode, sortKeyCodes } from "../../shared/io/keyCode";
import { sleep } from "../../shared/sleep";
import { EventType, Store } from "../store";

export function useShortcuts(store: Store) {
  const { dispatch } = store;
  const { shortcuts, ui } = store.state;
  const [activeKeys, setActiveKeys] = useState<
    Record<string, boolean | undefined>
  >({});
  const [interval, setIntervalState] = useState<NodeJS.Timer>();
  const [didKeysChange, setDidKeysChange] = useState(false);

  if (shortcuts.length === 0) {
    console.warn("No shortcuts passed to useShortcuts() hook.");
  }

  // Needs to be wrapped in useEffect() to prevent React from throwing a error
  useEffect(() => {
    if (didKeysChange) {
      const activeKeysArray = toKeyArray(activeKeys);
      const shortcut = shortcuts.find(
        (s) =>
          isEqual(s.keys, activeKeysArray) &&
          !s.disabled &&
          isFocused(ui, s.when)
      );

      if (shortcut != null) {
        void dispatch(shortcut.event as EventType, undefined!);

        if (shortcut.repeat) {
          (async () => {
            /*
             * First pause is twice as long to ensure a user really
             * wants it to repeat (IE hold to continue scrolling down)
             * vs just being a false negative.
             */
            await sleep(250);
            const currKeys = toKeyArray(activeKeys);

            if (isEqual(currKeys, activeKeysArray)) {
              let int = setInterval(() => {
                void dispatch(shortcut.event as EventType, undefined!);
              }, 125);

              setIntervalState(int);
            }
          })();
        }
      }

      setDidKeysChange(false);
    }
  }, [activeKeys, shortcuts, didKeysChange]);

  useEffect(() => {
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
        setActiveKeys((prev) => ({ ...prev, [key]: true }));
        setDidKeysChange(true);
      }
    };

    const keyUp = ({ code }: KeyboardEvent) => {
      const key = parseKeyCode(code);
      setActiveKeys((prev) => {
        delete prev[key];
        return prev;
      });

      if (interval != null) {
        clearInterval(interval);
        setIntervalState(undefined);
      }
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [shortcuts, dispatch]);
}

export function isFocused(ui: UI, when?: Section): boolean {
  if (ui.focused == null || ui.focused[0] == null) {
    return when == null;
  } else if (when == null) {
    return true;
  } else {
    const [curr] = ui.focused;
    return when === curr;
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
