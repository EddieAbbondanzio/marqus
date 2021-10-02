import { flatten, OneOrMore } from "@/utils";
import _ from "lodash";
import { isModifier, isValidKeyCode, KeyCode } from "./key-code";

export interface ShortcutRaw<C extends string> { keys: KeyCode[], command: C, context?: string }
export interface ShortcutMapping { keys: string, command: string, context?: string, userDefined?: boolean }

export type ShortcutRawOrMap<C extends string> = ShortcutRaw<C> | ShortcutMapping[];

export const KEYCODE_DELIMITER = "+";

export class ShortcutState {
  map: { [keys: string]: {command: string, context?: string }[] } = {};

  invertedMap: { [command: string]: { keys: string, userDefined?: boolean }} = {};

  activeKeys: { [key: string]: boolean } = {};
}

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
