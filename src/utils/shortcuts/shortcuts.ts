import { isModifier, isValidKeyCode, KeyCode, parseKey } from "@/utils/shortcuts/key-code";
import _ from "lodash";
import { contexts } from "..";
import { commands } from "../commands";
import { flatten, OneOrMore } from "../types";

export const KEYCODE_DELIMITER = "+";

export interface ShortcutRaw<C extends string> { keys: KeyCode[], command: C, context?: string }
export interface ShortcutMapping { keys: string, command: string, context?: string, userDefined?: boolean }

let map: { [keys: string]: {command: string, context?: string }[] } = {};

const invertedMap: { [command: string]: { keys: string, userDefined?: boolean }} = {};

let activeKeys: { [key: string]: boolean } = {};

export function _onKeyDown(e: KeyboardEvent) {
  const key = parseKey(e.code);

  // Disable default arrow key actions
  if (
    key === KeyCode.ArrowLeft ||
    key === KeyCode.ArrowRight ||
    key === KeyCode.ArrowUp ||
    key === KeyCode.ArrowDown
  ) {
    e.preventDefault();
  }

  if (activeKeys[key] != null) {
    return;
  }

  activeKeys[key] = true;

  // Retrieve the set of keys currently pressed down.
  const active = Object.keys(activeKeys) as KeyCode[];
  const keyCodeString = keyCodesToString(active);

  const maps = map[keyCodeString];

  if (maps == null || maps.length === 0) {
    return;
  }

  for (const { command, context } of maps) {
    if (context == null || contexts.isFocused(context)) {
      commands.run(command);
    }
  }
}

export function _onKeyUp(e: KeyboardEvent) {
  const key = parseKey(e.code);
  delete activeKeys[key];
}

window.addEventListener("keydown", _onKeyDown);
window.addEventListener("keyup", _onKeyUp);

export function keyCodesToString(keys: OneOrMore<KeyCode>): string {
  const k = flatten(keys);

  if (k.length === 0) {
    throw Error("Shortcut must have at least 1 key");
  }

  if (new Set(k).size !== k.length) {
    console.error("Duplicate keys in shortcut: ", k);
    throw Error("Duplicate keys detected in shortcut");
  }

  const [modifiers, normalKeys] = _.partition(k, isModifier);

  // Map the values in the array into an object for that O(1) lookup.
  const modifierFlags = modifiers.reduce(
    (accumulator: any, modifier) => ({ ...accumulator, [modifier]: true }),
    {}
  );

  /*
   * Modifiers should always be first, and in a specific order.
   */

  const shortcutKeys: KeyCode[] = [];

  if (modifierFlags.control) {
    shortcutKeys.push(KeyCode.Control);
  }

  if (modifierFlags.shift) {
    shortcutKeys.push(KeyCode.Shift);
  }

  if (modifierFlags.alt) {
    shortcutKeys.push(KeyCode.Alt);
  }

  // Add the rest of the keys. These can be in any order.
  shortcutKeys.push(...normalKeys);

  return shortcutKeys.join(KEYCODE_DELIMITER);
}

export function parseKeyCodes(
  shortcutString: string
): KeyCode[] {
// Split up the keys, and remove any duplicates.
  const rawKeys = _.uniq(shortcutString.split(KEYCODE_DELIMITER));
  const keys: KeyCode[] = [];

  for (const key of rawKeys) {
    const trimmedKey = key.trim();

    if (!isValidKeyCode(trimmedKey)) {
      throw Error(`Invalid key code: ${trimmedKey}`);
    }

    keys.push(trimmedKey);
  }

  return keys;
}

export const GENERAL_USE_SHORTCUTS = {
  moveSelectionUp: KeyCode.ArrowUp,
  moveSelectionDown: KeyCode.ArrowDown,
  redo: [KeyCode.Control, KeyCode.LetterZ],
  undo: [KeyCode.Control, KeyCode.LetterY],
  rename: KeyCode.F2,
  toggleSelection: KeyCode.Space,
  scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
  scrollDown: [KeyCode.Control, KeyCode.ArrowDown]
};

export const shortcuts = {
  map<C extends string>(mappings: OneOrMore<ShortcutRaw<C> | ShortcutMapping>, userDefined = false) {
    for (const { command, keys, context } of flatten(mappings)) {
      const keyString = Array.isArray(keys) ? keyCodesToString(keys) : keys;

      // If we are override an existing shortcut, remove the old one.
      const existing = invertedMap[command];
      if (existing != null) {
        map[existing.keys] = map[existing.keys].filter(m => m.command !== command);
      }

      // Set up the new one
      (map[keyString] ??= []).push({ command, context });
      invertedMap[command] = { keys: keyString, userDefined };
    }
  },
  reset() {
    activeKeys = {};
    map = {};
  },
  dispose() {
    window.removeEventListener("keydown", _onKeyDown);
    window.removeEventListener("keyup", _onKeyUp);
  }
};
