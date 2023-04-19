import { chain, isEqual } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import {
  KeyCode,
  keyCodesToString,
  parseKeyCode,
  sortKeyCodes,
} from "../../shared/io/keyCode";
import { Store } from "../store";
import { sleep } from "../../shared/utils";
import { Shortcut } from "../../shared/domain/shortcut";
import { UIEventType } from "../../shared/ui/events";
import { Section } from "../../shared/ui/app";
import { log } from "../logger";
import { BrowserWindowEvent, IpcChannel } from "../../shared/ipc";

const INITIAL_DELAY_MS = 300;
const REPEAT_DELAY_MS = 150;

export function useShortcuts(store: Store): void {
  const activeKeys = useRef<Record<string, boolean>>({});
  const interval = useRef<NodeJS.Timer>();
  const lastTriggerTime = useRef(Date.now());

  const handleChange = useCallback(() => {
    const { state } = store;

    if (interval.current != null) {
      clearInterval(interval.current);
      interval.current = undefined;
    }

    const shortcut = state.shortcuts.find(
      s =>
        !s.disabled &&
        isEqual(s.keys, activeKeysToArray(activeKeys.current)) &&
        doesSectionHaveFocus(state.focused, s.when),
    );

    if (shortcut != null) {
      void store.dispatch(shortcut.event as UIEventType, shortcut.eventInput);

      // Track time of last shortcut trigger to prevent repeat shortcuts from
      // being triggered multiple times if the shortcut was pressed, released, and
      // pressed again before the repeat interval fires.
      const currTime = Date.now();
      lastTriggerTime.current = currTime;

      if (shortcut.repeat) {
        void (async () => {
          const keysStarted = activeKeysToArray(activeKeys.current);

          // First pause is twice as long to ensure the user actually wants to
          // repeat the action vs they accidentally held down the keys too long.
          await sleep(INITIAL_DELAY_MS);

          const keysAfterInitialDelay = activeKeysToArray(activeKeys.current);

          const trigger = () => {
            const keysOnInterval = activeKeysToArray(activeKeys.current);
            if (
              isEqual(keysStarted, keysOnInterval) &&
              lastTriggerTime.current === currTime
            ) {
              void store.dispatch(
                shortcut.event as UIEventType,
                shortcut.eventInput,
              );
            }
          };

          if (isEqual(keysStarted, keysAfterInitialDelay)) {
            trigger();
            interval.current = setInterval(trigger, REPEAT_DELAY_MS);
          }
        })();
      }
    }
  }, [store]);

  // Reset active keys when the browser window loses focus to prevent active keys
  // from getting stuck keys because we couldn't listen for the keyup event.
  useEffect(() => {
    const onWindowBlur = (ev: CustomEvent<{ event: BrowserWindowEvent }>) => {
      if (ev.detail.event === BrowserWindowEvent.Blur) {
        activeKeys.current = {};
      }
    };

    window.addEventListener(IpcChannel.BrowserWindow, onWindowBlur);

    return () => {
      window.removeEventListener(IpcChannel.BrowserWindow, onWindowBlur);
    };
  }, []);

  // Subscribe to window events
  useEffect(() => {
    const keyUp = ({ code }: KeyboardEvent) => {
      const key = parseKeyCode(code);
      if (key == null) {
        return;
      }

      delete activeKeys.current[key];

      handleChange();
    };

    const keyDown = (ev: KeyboardEvent) => {
      // Prevent redundant calls
      if (!ev.repeat) {
        const key = parseKeyCode(ev.code);
        if (key == null) {
          void log.info(`Unknown key: ${ev.code}`);
          return;
        }

        activeKeys.current[key] = true;
        handleChange();
      }
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [handleChange]);
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
  // Ex: EditorToolbar can trigger Editor shortcuts
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
