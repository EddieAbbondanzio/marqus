import {
  Dispatch,
  Reducer,
  ReducerAction,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { CommandName, Execute } from "../commands";
import { isModifier, isValidKeyCode, KeyCode, parseKeyCode } from "./keyCode";
import { useAsync } from "react-async-hook";
import { isEqual, partition, uniq } from "lodash";
import { DEFAULT_SHORTCUTS } from "./defaultShortcuts";
import { IsFocused } from "../ui/focusables";

export interface Keyboard {
  enabled: boolean;
  activeKeys: Record<string, boolean | undefined>;
  shortcuts: Shortcut[];
}

export interface KeyboardActionLoadShortcuts {
  type: "loadShortcuts";
  shortcuts: Shortcut[];
}

export interface KeyboardActionEnable {
  type: "enable";
}

export interface KeyboardActionDisable {
  type: "disable";
}

export interface KeyboardActionKeyDown {
  type: "keyDown";
  key: KeyCode;
}

export interface KeyboardActionKeyUp {
  type: "keyUp";
  key: KeyCode;
}

export type KeyboardAction =
  | KeyboardActionEnable
  | KeyboardActionDisable
  | KeyboardActionKeyDown
  | KeyboardActionKeyUp
  | KeyboardActionLoadShortcuts;

export interface Shortcut {
  command: CommandName;
  keys: KeyCode[];
  disabled?: boolean;
  when?: string;
}

export interface ShortcutOverride {
  command: CommandName;
  keys?: string;
  disabled?: boolean;
  when?: string;
}

export const SHORTCUT_FILE = "shortcuts.json";
export const KEYCODE_DELIMITER = "+";

const reducer: Reducer<Keyboard, KeyboardAction> = (state, action) => {
  let key: KeyCode;

  switch (action.type) {
    case "enable":
      return { ...state, enabled: true };

    case "disable":
      return { ...state, enabled: false };

    case "keyUp":
      ({ key } = action);
      return {
        ...state,
        activeKeys: { ...state.activeKeys, [key]: undefined },
      };

    case "keyDown":
      ({ key } = action);
      return { ...state, activeKeys: { ...state.activeKeys, [key]: true } };

    case "loadShortcuts":
      return {
        ...state,
        // s.disabled != false is intentional. !s.disabled will exclude shortcuts
        // with disabled = undefined.
        shortcuts: action.shortcuts.filter((s) => s.disabled != false),
      };
  }
};

/**
 * Hook to listen for keys being pressed / released.
 * Should only be called once in the root React component.
 */
export function useKeyboard(execute: Execute, isFocused: IsFocused) {
  const [state, dispatch] = useReducer(reducer, {
    enabled: true,
    activeKeys: {},
    shortcuts: [],
  });

  useAsync(async () => {
    console.log("useAsync");
    /*
     * Load user shortcuts. User's should be able to change the keys, when,
     * or disable an existing shortcut. User's should also be able to create
     * new shortcuts.
     */

    const userShortcuts = await loadUserShortcuts();
    let newShortcuts = [];

    for (const defaultShortcut of DEFAULT_SHORTCUTS) {
      const userOverride = userShortcuts.find(
        (s) => s.command === defaultShortcut.command
      );

      let shortcut: Shortcut;

      if (userOverride == null) {
        shortcut = Object.assign({}, defaultShortcut, userOverride);
      } else {
        // Validate it has keys if it's new.
        if (userOverride.keys == null) {
          throw Error(
            `User defined shortcut for ${userOverride.command} does not have any keys specified`
          );
        }

        shortcut = Object.assign(
          {},
          { ...userOverride, keys: parseKeyCodes(userOverride.keys) }
        );
      }

      newShortcuts.push(shortcut);
    }

    dispatch({ type: "loadShortcuts", shortcuts: newShortcuts });
  }, []);

  const context = {
    execute,
    dispatch,
    state,
  };

  /*
   * We have to wrap event listeners so we can pass and additional
   * argument to them.
   */

  const keyDown = (ev: KeyboardEvent) => {
    // Prevent redundant calls
    if (ev.repeat) {
      return;
    }

    onKeyDown(dispatch, ev);
  };

  const keyUp = (ev: KeyboardEvent) => onKeyUp(dispatch, ev);

  useEffect(() => {
    // Retrieve every currently pressed key
    const keys = Object.entries(state.activeKeys)
      .filter(([, active]) => active)
      .map(([key]) => key as KeyCode);

    // Check to see if we have a shortcut that matches the current combo
    const shortcut = state.shortcuts.find((s) => isEqual(s.keys, keys));

    /*
     * If we found a shortcut fire it.
     * Everytime state changes, aka dispatch() is fired we trigger a
     * re-render. This gives us the perfect change to check for commands
     * to fire because it means the keys have changed.
     */
    if (shortcut != null) {
      void execute(shortcut.command as CommandName, null!);
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  });

  return {
    isKeyDown: (key: KeyCode) => state.activeKeys[key] ?? false,
  };
}

const onKeyDown = (
  dispatch: Dispatch<KeyboardAction>,
  { code }: KeyboardEvent
) => {
  const key = parseKeyCode(code);
  dispatch({ type: "keyDown", key });
};

const onKeyUp = (
  dispatch: Dispatch<KeyboardAction>,
  { code }: KeyboardEvent
) => {
  const key = parseKeyCode(code);
  dispatch({ type: "keyUp", key });
};

export function sort(keys: KeyCode[]): KeyCode[] {
  const [modifiers, normalKeys] = partition(keys, isModifier);

  // Map the values in the array into an object for that O(1) lookup.
  const modifierFlags = modifiers.reduce(
    (accumulator: any, modifier) => ({ ...accumulator, [modifier]: true }),
    {}
  );

  /*
   * Modifiers should always be first, and in a specific order.
   */

  const sorted: KeyCode[] = [];

  if (modifierFlags.control) {
    sorted.push(KeyCode.Control);
  }

  if (modifierFlags.shift) {
    sorted.push(KeyCode.Shift);
  }

  if (modifierFlags.alt) {
    sorted.push(KeyCode.Alt);
  }

  // Add the rest of the keys. Sorted alphabetically lol.
  sorted.push(...normalKeys.sort());
  return sorted;
}

export function keyCodesToString(keys: KeyCode[]): string {
  if (keys.length === 0) {
    throw Error("Shortcut must have at least 1 key");
  }

  if (new Set(keys).size !== keys.length) {
    console.error("Duplicate keys in shortcut: ", keys);
    throw Error("Duplicate keys detected in shortcut");
  }

  const shortcutKeys = sort(keys);
  return shortcutKeys.join(KEYCODE_DELIMITER);
}

export function parseKeyCodes(shortcutString: string): KeyCode[] {
  // Split up the keys, and remove any duplicates.
  const rawKeys = uniq(shortcutString.split(KEYCODE_DELIMITER));
  const keys: KeyCode[] = [];

  for (const key of rawKeys) {
    const trimmedKey = key.trim();

    if (!isValidKeyCode(trimmedKey)) {
      throw Error(`Invalid key code: ${trimmedKey}`);
    }

    keys.push(trimmedKey);
  }

  return sort(keys);
}

export async function loadUserShortcuts(): Promise<ShortcutOverride[]> {
  return [];
}
