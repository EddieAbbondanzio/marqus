import { isModifier, isValidKeyCode, KeyCode, parseKey } from "@/utils/shortcuts/key-code";
import _ from "lodash";
import { commands } from "../commands";
import { flatten, OneOrMore } from "../one-or-more";

export const KEYCODE_DELIMITER = "+";

export type ShortcutDefinition = {keys: OneOrMore<KeyCode>, command: string };

let defined: { [keys: string]: { command: string }} = {};
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
  const shortcut = defined[keyCodeString];

  if (shortcut == null) {
    return;
  }

  commands.run(shortcut.command);
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

  const shortcutKeys: KeyCode[] = [];

  const [modifiers, normalKeys] = _.partition(k, isModifier);

  // Map the values in the array into an object for that O(1) lookup.
  const modifierFlags = modifiers.reduce(
    (accumulator: any, modifier) => ({ ...accumulator, [modifier]: true }),
    {}
  );

  /*
   * Modifiers should always be first, and in a specific order.
   */

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

export const shortcuts = {
  register(mappings: OneOrMore<ShortcutDefinition>) {
    const toRegister: ShortcutDefinition[] = flatten(mappings);

    for (const { keys, command } of toRegister) {
      const keyString = keyCodesToString(keys);
      defined[keyString] = { command };
    }
  },
  reset() {
    activeKeys = {};
    defined = {};
  },
  dispose() {
    window.removeEventListener("keydown", _onKeyDown);
    window.removeEventListener("keyup", _onKeyUp);
  }
};
