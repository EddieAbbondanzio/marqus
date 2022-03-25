import { chain, isEqual } from "lodash";
import { useEffect, useState } from "react";
import { KeyCode, parseKeyCode, sortKeyCodes } from "../../shared/io/keyCode";
import { sleep } from "../../shared/sleep";
import { Section, UI } from "../../shared/domain/state";
import { EventType, Store } from "../store";

const INITIAL_DELAY = 250;
const REPEAT_DELAY = 125;

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
        void dispatch(shortcut.event as EventType, shortcut.eventInput);

        if (shortcut.repeat) {
          (async () => {
            /*
             * First pause is twice as long to ensure a user really
             * wants it to repeat (IE hold to continue scrolling down)
             * vs just being a key held too long.
             */
            await sleep(INITIAL_DELAY);
            const currKeys = toKeyArray(activeKeys);

            if (isEqual(currKeys, activeKeysArray)) {
              let int = setInterval(() => {
                void dispatch(shortcut.event as EventType, shortcut.eventInput);
              }, REPEAT_DELAY);

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
       * everything but gives the user a chance to redefine or disable any
       * shortcut as they see fit.
       */
      const tagName = (ev.target as HTMLElement).tagName;
      if (tagName !== "INPUT" && tagName !== "TEXTAREA") {
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
