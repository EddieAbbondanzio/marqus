import { chain, isEqual } from "lodash";
import { useEffect, useState } from "react";
import {
  KeyCode,
  keyCodesToString,
  parseKeyCode,
  sortKeyCodes,
} from "../../shared/io/keyCode";
import { UIEventType, Section, UI } from "../../shared/domain/ui";
import { Store } from "../store";
import { sleep } from "../../shared/utils";
import { Shortcut } from "../../shared/domain/shortcut";

const INITIAL_DELAY = 250;
const REPEAT_DELAY = 125;

export function useShortcuts(store: Store): void {
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
          !s.disabled &&
          isEqual(s.keys, activeKeysArray) &&
          isFocused(ui, s.when)
      );

      if (shortcut != null) {
        console.log("dispatch: ", shortcut);
        void dispatch(shortcut.event as UIEventType, shortcut.eventInput);

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
              const interval = setInterval(() => {
                void dispatch(
                  shortcut.event as UIEventType,
                  shortcut.eventInput
                );
              }, REPEAT_DELAY);

              setIntervalState(interval);
            }
          })();
        }
      }

      setDidKeysChange(false);
    }
  }, [dispatch, ui, activeKeys, shortcuts, didKeysChange]);

  useEffect(() => {
    const keyDown = (ev: KeyboardEvent) => {
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
  }, [interval, shortcuts, dispatch]);
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

export function getShortcutLabels(
  shortcuts: Shortcut[]
): Partial<Record<UIEventType, string>> {
  const lookup: Partial<Record<UIEventType, string>> = {};

  for (const shortcut of shortcuts) {
    lookup[shortcut.event] = keyCodesToString(shortcut.keys);
  }

  return lookup;
}
