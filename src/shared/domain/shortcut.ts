// import _ from "lodash";
// // import { isModifier, isValidKeyCode, KeyCode } from "./keyCode";

// export interface Shortcut {
//   /**
//    * Name of the command to run.
//    */
//   // command: NamespacedCommand;
//   /**
//    * Trigger keys for the shortcut.
//    */
//   keys: KeyCode[];
//   /**
//    * Context that needs to be focused in order for the shortcut to trigger.
//    * Ignored if global is set to true.
//    */
//   context?: string;
//   /**
//    * If the shortcut should be triggerable from anywhere.
//    */
//   global?: boolean;
//   /**
//    * If the shortcut a custom one that the user created.
//    */
//   userDefined?: boolean;
// }

// export const KEYCODE_DELIMITER = "+";

// export class ShortcutState {
//   /**
//    * Shortcut lookup via their delimited key string
//    */
//   map: { [keys: string]: Shortcut[] } = {};

//   /**
//    * Shortcut lookup via the command they invoke.
//    */
//   invertedMap: { [command: string]: Shortcut } = {};

//   activeKeys: { [key: string]: boolean } = {};
// }

// export function keyCodesToString(keys: KeyCode | KeyCode[]): string {
//   const k = Array.isArray(keys) ? keys : [keys];

//   if (k.length === 0) {
//     throw Error("Shortcut must have at least 1 key");
//   }

//   if (new Set(k).size !== k.length) {
//     console.error("Duplicate keys in shortcut: ", k);
//     throw Error("Duplicate keys detected in shortcut");
//   }

//   const [modifiers, normalKeys] = _.partition(k, isModifier);

//   // Map the values in the array into an object for that O(1) lookup.
//   const modifierFlags = modifiers.reduce(
//     (accumulator: any, modifier) => ({ ...accumulator, [modifier]: true }),
//     {}
//   );

//   /*
//    * Modifiers should always be first, and in a specific order.
//    */

//   const shortcutKeys: KeyCode[] = [];

//   if (modifierFlags.control) {
//     shortcutKeys.push(KeyCode.Control);
//   }

//   if (modifierFlags.shift) {
//     shortcutKeys.push(KeyCode.Shift);
//   }

//   if (modifierFlags.alt) {
//     shortcutKeys.push(KeyCode.Alt);
//   }

//   // Add the rest of the keys. These can be in any order.
//   shortcutKeys.push(...normalKeys);

//   return shortcutKeys.join(KEYCODE_DELIMITER);
// }

// export function parseKeyCodes(shortcutString: string): KeyCode[] {
//   // Split up the keys, and remove any duplicates.
//   const rawKeys = _.uniq(shortcutString.split(KEYCODE_DELIMITER));
//   const keys: KeyCode[] = [];

//   for (const key of rawKeys) {
//     const trimmedKey = key.trim();

//     if (!isValidKeyCode(trimmedKey)) {
//       throw Error(`Invalid key code: ${trimmedKey}`);
//     }

//     keys.push(trimmedKey);
//   }

//   return keys;
// }

// export const GENERAL_USE_KEYS = {
//   tab: [KeyCode.Tab],
//   enter: [KeyCode.Enter],
//   moveSelectionUp: [KeyCode.ArrowUp],
//   moveSelectionDown: [KeyCode.ArrowDown],
//   redo: [KeyCode.Control, KeyCode.LetterZ],
//   undo: [KeyCode.Control, KeyCode.LetterY],
//   rename: [KeyCode.F2],
//   toggleSelection: [KeyCode.Space],
//   scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
//   scrollDown: [KeyCode.Control, KeyCode.ArrowDown],
// };
