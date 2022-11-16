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

const INITIAL_DELAY = 250; // ms
const REPEAT_DELAY = 125; // ms

export function useShortcuts(store: Store): void {
  const { dispatch, state } = store;
  const { shortcuts } = state;
  const activeKeys = useRef<Record<string, boolean | undefined>>({});
  const interval = useRef<NodeJS.Timer>();

  // useState so we can trigger a re-render of the component and process any
  // any changes in keys.
  const [didKeysChange, setDidKeysChange] = useState(false);

  if (!isTest() && shortcuts.length === 0) {
    console.warn("No shortcuts passed to useShortcuts() hook.");
  }

  const resetState = () => {
    clearInterval(interval.current!);
    interval.current = undefined;
    setDidKeysChange(true);
  };

  if (didKeysChange) {
    const shortcut = shortcuts.find(
      s =>
        !s.disabled &&
        isEqual(s.keys, toKeyArray(activeKeys.current)) &&
        shouldExecute(state.focused, s.when),
    );

    if (shortcut != null) {
      void dispatch(shortcut.event as UIEventType, shortcut.eventInput);

      if (shortcut.repeat) {
        (async () => {
          const keysStarted = toKeyArray(activeKeys.current);

          /*
           * First pause is twice as long to ensure user actually wants it to
           * repeat (IE hold to continue scrolling down) vs just a key held
           * too long.
           */
          await sleep(INITIAL_DELAY);
          const keysAfterInitialDelay = toKeyArray(activeKeys.current);

          const trigger = () => {
            const keysOnInterval = toKeyArray(activeKeys.current);
            if (isEqual(keysStarted, keysOnInterval)) {
              void dispatch(shortcut.event as UIEventType, shortcut.eventInput);
            }
          };

          if (isEqual(keysStarted, keysAfterInitialDelay)) {
            trigger();
            interval.current = setInterval(trigger, REPEAT_DELAY);
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
          log.info(`Unknown key: ${ev.code}`);
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

export function shouldExecute(focused?: Section[], when?: Section): boolean {
  if (focused == null || focused[0] == null) {
    return when == null;
  } else if (when == null) {
    return true;
  } else {
    const [curr] = focused;
    return when === curr;
  }
}

export const toKeyArray = (
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
