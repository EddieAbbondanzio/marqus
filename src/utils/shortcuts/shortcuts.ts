import { isModifier, isValidKeyCode, KeyCode, parseKey } from "@/utils/shortcuts/key-code";
import _ from "lodash";
import { contexts } from "..";
import { commands } from "../commands";
import { flatten, OneOrMore, PartialRecord } from "../types";

export const KEYCODE_DELIMITER = "+";

export type GeneralUseShortcuts =
| "toggleSelection"
| "moveSelectionUp"
| "moveSelectionDown"
| "scrollUp"
| "scrollDown"
| "undo"
| "redo"
| "rename"

let defined: { [keys: string]: { name: string }} = {};
let mapped: { [shortcut: string]: {command: string, context?: string } []} = {};

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

  console.log("shortcut", shortcut);
  const maps = mapped[shortcut.name];

  console.log("maps: ", mapped);
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

export type GeneralShortcutOr<T extends string> = GeneralUseShortcuts | T;

export const shortcuts = {
  define<T extends string>(defs: PartialRecord<T, OneOrMore<KeyCode>>) {
    for (const [name, keys] of Object.entries(defs)) {
      const keyString = keyCodesToString(flatten(keys as any));
      defined[keyString] = { name };
    }
  },
  map<S extends string, C extends string>(maps: PartialRecord<GeneralShortcutOr<S>, C>, opts?: { context: string }) {
    for (const [shortcut, command] of Object.entries(maps)) {
      (mapped[shortcut!] ??= []).push({ command: command!, ...opts });
    }
  },
  reset() {
    activeKeys = {};
    defined = {};
    mapped = {};
  },
  dispose() {
    window.removeEventListener("keydown", _onKeyDown);
    window.removeEventListener("keyup", _onKeyUp);
  }
};

shortcuts.define<GeneralUseShortcuts>({
  moveSelectionUp: KeyCode.ArrowUp,
  moveSelectionDown: KeyCode.ArrowDown,
  redo: [KeyCode.Control, KeyCode.LetterZ],
  undo: [KeyCode.Control, KeyCode.LetterY],
  rename: KeyCode.F2,
  toggleSelection: KeyCode.Space,
  scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
  scrollDown: [KeyCode.Control, KeyCode.ArrowDown]
})
;
