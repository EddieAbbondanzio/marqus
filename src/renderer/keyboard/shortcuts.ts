import { partition, uniq } from "lodash";
import { CommandName } from "../../renderer/commands";
import { isModifier, isValidKeyCode, KeyCode } from "./keyCode";

export const KEYCODE_DELIMITER = "+";

export interface Shortcut {
  command: CommandName;
  keys: KeyCode[];
  when?: string;
}

export function keyCodesToString(keys: KeyCode[]): string {
  if (keys.length === 0) {
    throw Error("Shortcut must have at least 1 key");
  }

  if (new Set(keys).size !== keys.length) {
    console.error("Duplicate keys in shortcut: ", keys);
    throw Error("Duplicate keys detected in shortcut");
  }

  const [modifiers, normalKeys] = partition(keys, isModifier);

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

  return keys;
}

export const COMMON_KEY_COMBOS: Record<string, KeyCode[]> = {
  scrollDown: [KeyCode.Control, KeyCode.ArrowDown],
  scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
};

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    command: "globalNavigation.scrollDown",
    keys: COMMON_KEY_COMBOS.scrollDown,
    when: "globalNavigation",
  },
  {
    command: "globalNavigation.scrollUp",
    keys: COMMON_KEY_COMBOS.scrollUp,
    when: "globalNavigation",
  },
];

export function findShortcut(
  keys: KeyCode[],
  when?: string
): Shortcut | undefined {
  throw Error();
}
