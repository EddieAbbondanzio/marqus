import { chain, isEqual } from "lodash";
import { useEffect, useRef, useState } from "react";
import {
  KeyCode,
  keyCodesToString,
  parseKeyCode,
  sortKeyCodes,
} from "../../shared/io/keyCode";
import { Store } from "../store";
import { sleep } from "../../shared/utils";
import { Shortcut } from "../../shared/domain/shortcut";
import { isTest } from "../../shared/env";
import { UIEventType } from "../../shared/ui/events";
import { Section } from "../../shared/ui/app";
import { log } from "../logger";

const INITIAL_DELAY_MS = 250;
const REPEAT_DELAY_MS = 125;

export function useShortcuts(store: Store): void {
  const { dispatch, state } = store;
  const { shortcuts } = state;
  const activeKeys = useRef<Record<string, boolean | undefined>>({});
  const interval = useRef<NodeJS.Timer>();

  // We use useState because we want to trigger a re-render if the keys change.
  const [didKeysChange, setDidKeysChange] = useState(false);

  if (!isTest() && shortcuts.length === 0) {
    void log.info("No shortcuts were passed to the useShortcuts hook");
  }

  const resetState = () => {
    if (interval.current != null) {
      clearInterval(interval.current!);
      interval.current = undefined;
    }

    setDidKeysChange(true);
  };

  if (didKeysChange) {
    const shortcut = shortcuts.find(
      s =>
        !s.disabled &&
        isEqual(s.keys, activeKeysToArray(activeKeys.current)) &&
        doesSectionHaveFocus(state.focused, s.when),
    );

    if (shortcut != null) {
      void dispatch(shortcut.event as UIEventType, shortcut.eventInput);

      if (shortcut.repeat) {
        void (async () => {
          const keysStarted = activeKeysToArray(activeKeys.current);

          // First pause is twice as long to ensure the user actually wants to
          // repeat the action vs they accidentally held down the keys too long.
          await sleep(INITIAL_DELAY_MS);

          const keysAfterInitialDelay = activeKeysToArray(activeKeys.current);

          const trigger = () => {
            const keysOnInterval = activeKeysToArray(activeKeys.current);
            if (isEqual(keysStarted, keysOnInterval)) {
              void dispatch(shortcut.event as UIEventType, shortcut.eventInput);
            }
          };

          if (isEqual(keysStarted, keysAfterInitialDelay)) {
            trigger();
            interval.current = setInterval(trigger, REPEAT_DELAY_MS);
          }
        })();
      }
    }

    setDidKeysChange(false);
  }

  useEffect(() => {
    const keyDown = (ev: KeyboardEvent) => {
      // Prevent redundant calls
      if (!ev.repeat) {
        const key = parseKeyCode(ev.code);
        if (key == null) {
          void log.info(`Unknown key: ${ev.code}`);
          return;
        }

        activeKeys.current = { ...activeKeys.current, [key]: true };
        resetState();
      }
    };

    const keyUp = ({ code }: KeyboardEvent) => {
      const key = parseKeyCode(code);
      if (key == null) {
        return;
      }

      delete activeKeys.current[key];

      resetState();
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [interval, shortcuts, dispatch]);
}

export function doesSectionHaveFocus(
  focused?: Section[],
  when?: Section,
): boolean {
  // Global
  if (when == null) {
    return true;
  }

  if (focused == null || focused.length === 0) {
    return false;
  }

  // We support nested sections triggering shortcuts in their parents by checking
  // to see if the section name starts with the parent's name.
  // Ex: EditorTabs can trigger Editor shortcuts
  const [currentlyFocused] = focused;
  return currentlyFocused === when || currentlyFocused.startsWith(when);
}

export const activeKeysToArray = (
  activeKeys: Record<string, boolean | undefined>,
): KeyCode[] =>
  chain(activeKeys)
    .entries()
    .filter(([, active]) => active == true)
    .map(([key]) => key as KeyCode)
    .thru(sortKeyCodes)
    .value();

export function getShortcutLabels(
  shortcuts: Shortcut[],
): Partial<Record<UIEventType, string>> {
  const lookup: Partial<Record<UIEventType, string>> = {};

  for (const shortcut of shortcuts) {
    lookup[shortcut.event] = keyCodesToString(shortcut.keys);
  }

  return lookup;
}
