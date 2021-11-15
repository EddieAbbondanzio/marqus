import {
  Dispatch,
  Reducer,
  ReducerAction,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { CommandName, COMMAND_REGISTRY, Execute } from "../commands";
import { isModifier, isValidKeyCode, KeyCode, parseKeyCode } from "./keyCode";
import { useAsync } from "react-async-hook";
import { chain, isEqual, partition, uniq } from "lodash";
import { DEFAULT_SHORTCUTS } from "./defaultShortcuts";
import { IsFocused } from "../ui/focusables";
import * as yup from "yup";
import { SchemaOf } from "yup";
import { sleep } from "../../shared/utils/sleep";
import { Config } from "../config";

export interface Keyboard {
  enabled: boolean;
  activeKeys: Record<string, boolean | undefined>;
  shortcuts: Shortcut[];
  repeating?: NodeJS.Timer;
}

export type IsKeyDown = (key: KeyCode) => boolean;

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

export interface KeyboardStartRepeat {
  type: "startRepeat";
  shortcut: Shortcut;
  repeating: NodeJS.Timer;
}

export interface KeyboardStopRepeat {
  type: "stopRepeat";
}

// Add start timer event?

export type KeyboardAction =
  | KeyboardActionEnable
  | KeyboardActionDisable
  | KeyboardActionKeyDown
  | KeyboardActionKeyUp
  | KeyboardActionLoadShortcuts
  | KeyboardStartRepeat
  | KeyboardStopRepeat;

export interface Shortcut {
  command: CommandName;
  keys: KeyCode[];
  disabled?: boolean;
  when?: string;
  repeat?: boolean;
}

export interface ShortcutOverride {
  command: CommandName;
  keys?: string;
  disabled?: boolean;
  when?: string;
  repeat?: boolean;
}

export enum RepeatDelay {
  First = 500,
  Remainder = 100,
}

export const VALID_COMMANDS: string[] = chain(COMMAND_REGISTRY).keys().value();
export const VALID_WHENS: string[] = chain(DEFAULT_SHORTCUTS)
  .filter((s) => s.when != null)
  .map((s) => s.when!)
  .uniq()
  .value();

export const SHORTCUT_FILE_SCHEMA: SchemaOf<ShortcutOverride[]> = yup
  .array()
  .of(
    yup.object().shape({
      command: yup
        .string()
        .required()
        .oneOf(VALID_COMMANDS) as yup.StringSchema<CommandName>,
      keys: yup.string().optional(),
      disabled: yup.boolean().optional(),
      when: yup.string().optional().oneOf(VALID_WHENS),
      repeat: yup.bool().optional(),
    })
  );

export const SHORTCUT_FILE = "shortcuts.json";
export const KEYCODE_DELIMITER = "+";

let isRepeating = false;

export const toArray = (activeKeys: Keyboard["activeKeys"]): KeyCode[] =>
  Object.entries(activeKeys)
    .filter(([, active]) => active)
    .map(([key]) => key as KeyCode)
    .sort();

/**
 * Hook to listen for keys being pressed / released.
 * Should only be called once in the root React component.
 */
export function useKeyboard(execute: Execute, isFocused: IsFocused) {
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

      case "startRepeat":
        return { ...state, repeating: action.repeating };

      case "stopRepeat":
        if (state.repeating == null) {
          return state;
        }

        isRepeating = false;
        return { ...state, repeating: undefined };
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    enabled: true,
    activeKeys: {},
    shortcuts: [],
  });

  useAsync(async () => {
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
    execute: useCallback(execute, [state.activeKeys]),
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

  useEffect(
    () => {
      // Retrieve every currently pressed key
      const keys = toArray(state.activeKeys);

      // Check to see if we have a shortcut that matches the current combo
      const shortcut = state.shortcuts.find((s) => isEqual(s.keys, keys));

      // Kill previous shortcut if running on repeat in loop (.repeat = true)
      dispatch({ type: "stopRepeat" });

      let repeating: NodeJS.Timer | undefined;

      /*
       * If we found a shortcut fire it.
       * Everytime state changes, aka dispatch() is fired we trigger a
       * re-render. This gives us the perfect change to check for commands
       * to fire because it means the keys have changed.
       */
      if (shortcut != null && !shortcut.disabled) {
        // undefined! over null! so we can support default parameters
        void execute(shortcut.command as CommandName, undefined!);

        (async () => {
          console.log("prev keys: ", keys);
          const prevKeys = keys;
          await sleep(RepeatDelay.First);
          const currKeys = toArray(state.activeKeys);

          if (isEqual(currKeys, prevKeys)) {
            repeating = setInterval(() => {
              void execute(shortcut.command, undefined!);
            }, RepeatDelay.Remainder);

            dispatch({ type: "startRepeat", shortcut, repeating });
          }
        })();

        /*
         * Prevent the chance of creating a memory leak.
         * Also prevents from spamming intervals
         */
        return () => {
          if (repeating != null) {
            clearInterval(repeating);
            repeating = undefined;
          }
        };
      }
    },
    /*
     * state.activeKeys is a required dependency as it protects us from
     * rapidly re-executing the command on each render.
     */
    [state.activeKeys]
  );

  useEffect(() => {
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  return {
    isKeyDown: (key: KeyCode) => state.activeKeys[key] ?? false,
  } as { isKeyDown: IsKeyDown };
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
  const raw = await Config.load({ name: SHORTCUT_FILE });

  if (raw == null) {
    return [];
  }

  const overrides = (await SHORTCUT_FILE_SCHEMA.validate(raw))!;

  // Is there any redundant keys?
  const duplicates = overrides.filter(
    (item, index) => overrides.findIndex((i) => i.keys === item.keys) != index
  );

  if (duplicates.length > 0) {
    throw Error(`Duplicate shortcuts for keys ${duplicates[0].keys}`);
    console.log("Error: Complete list of duplicate shortcuts: ", duplicates);
  }

  return overrides;
}
