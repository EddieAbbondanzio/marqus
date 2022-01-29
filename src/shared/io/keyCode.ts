import { partition, uniq } from "lodash";

export const KEYCODE_DELIMITER = "+";

/**
 * String identifiers of keys.
 */
export enum KeyCode {
  Escape = "esc",
  F1 = "f1",
  F2 = "f2",
  F3 = "f3",
  F4 = "f4",
  F5 = "f5",
  F6 = "f6",
  F7 = "f7",
  F8 = "f8",
  F9 = "f9",
  F10 = "f10",
  F11 = "f11",
  F12 = "f12",
  Insert = "insert",
  Delete = "delete",
  Backquote = "`",
  Digit1 = "1",
  Digit2 = "2",
  Digit3 = "3",
  Digit4 = "4",
  Digit5 = "5",
  Digit6 = "6",
  Digit7 = "7",
  Digit8 = "8",
  Digit9 = "9",
  Digit0 = "0",
  Minus = "-",
  Equal = "=",
  Backspace = "backspace",
  Tab = "tab",
  BracketLeft = "[",
  BracketRight = "]",
  Backslash = "\\",
  CapsLock = "capslock",
  Semicolon = ";",
  Quote = "'",
  Enter = "enter",
  Shift = "shift",
  Comma = ",",
  Period = ".",
  Slash = "/",
  Control = "control",
  Meta = "meta",
  Alt = "alt",
  ArrowUp = "up",
  ArrowLeft = "left",
  ArrowRight = "right",
  ArrowDown = "down",
  Space = "space",
  LetterA = "a",
  LetterB = "b",
  LetterC = "c",
  LetterD = "d",
  LetterE = "e",
  LetterF = "f",
  LetterG = "g",
  LetterH = "h",
  LetterI = "i",
  LetterJ = "j",
  LetterK = "k",
  LetterL = "l",
  LetterM = "m",
  LetterN = "n",
  LetterO = "o",
  LetterP = "p",
  LetterQ = "q",
  LetterR = "r",
  LetterS = "s",
  LetterT = "t",
  LetterU = "u",
  LetterV = "v",
  LetterW = "w",
  LetterX = "x",
  LetterY = "y",
  LetterZ = "z",
  Numpad0 = "numpad0",
  Numpad1 = "numpad1",
  Numpad2 = "numpad2",
  Numpad3 = "numpad3",
  Numpad4 = "numpad4",
  Numpad5 = "numpad5",
  Numpad6 = "numpad6",
  Numpad7 = "numpad7",
  Numpad8 = "numpad8",
  Numpad9 = "numpad9",
  NumpadMultiply = "numpadMultiply",
  NumpadAdd = "numpadAdd",
  NumpadSubtract = "numpadSubtract",
  NumpadSeparator = "numpadSeparator",
  NumpadDivide = "numpadDivide",
  NumpadDecimal = "numpadDecimal",
  PageDown = "pageDown",
  PageUp = "pageUp",
}

/**
 * Parse a DOM key code from the .code property of a KeyboardEvent.
 * @param code The raw dom key code to parse.
 * @returns Our typesafe KeyCode.
 */
export function parseKeyCode(code: string): KeyCode {
  /**
   * When using .code we treat a key the same regardless if shift was pressed.
   * This means + and = are the same key.
   */
  switch (code) {
    case "Space":
      return KeyCode.Space;
    case "Escape":
      return KeyCode.Escape;
    case "F1":
      return KeyCode.F1;
    case "F2":
      return KeyCode.F2;
    case "F3":
      return KeyCode.F3;
    case "F4":
      return KeyCode.F4;
    case "F5":
      return KeyCode.F5;
    case "F6":
      return KeyCode.F6;
    case "F7":
      return KeyCode.F7;
    case "F8":
      return KeyCode.F8;
    case "F9":
      return KeyCode.F9;
    case "F10":
      return KeyCode.F10;
    case "F11":
      return KeyCode.F11;
    case "F12":
      return KeyCode.F12;
    case "Insert":
      return KeyCode.Insert;
    case "Delete":
      return KeyCode.Delete;
    case "Backquote":
      return KeyCode.Backquote;
    case "Digit1":
      return KeyCode.Digit1;
    case "Digit2":
      return KeyCode.Digit2;
    case "Digit3":
      return KeyCode.Digit3;
    case "Digit4":
      return KeyCode.Digit4;
    case "Digit5":
      return KeyCode.Digit5;
    case "Digit6":
      return KeyCode.Digit6;
    case "Digit7":
      return KeyCode.Digit7;
    case "Digit8":
      return KeyCode.Digit8;
    case "Digit9":
      return KeyCode.Digit9;
    case "Digit0":
      return KeyCode.Digit0;
    case "Minus":
      return KeyCode.Minus;
    case "Equal":
      return KeyCode.Equal;
    case "Backspace":
      return KeyCode.Backspace;
    case "Tab":
      return KeyCode.Tab;
    case "KeyA":
      return KeyCode.LetterA;
    case "KeyB":
      return KeyCode.LetterB;
    case "KeyC":
      return KeyCode.LetterC;
    case "KeyD":
      return KeyCode.LetterD;
    case "KeyE":
      return KeyCode.LetterE;
    case "KeyF":
      return KeyCode.LetterF;
    case "KeyG":
      return KeyCode.LetterG;
    case "KeyH":
      return KeyCode.LetterH;
    case "KeyI":
      return KeyCode.LetterI;
    case "KeyJ":
      return KeyCode.LetterJ;
    case "KeyK":
      return KeyCode.LetterK;
    case "KeyL":
      return KeyCode.LetterL;
    case "KeyM":
      return KeyCode.LetterM;
    case "KeyN":
      return KeyCode.LetterN;
    case "KeyO":
      return KeyCode.LetterO;
    case "KeyP":
      return KeyCode.LetterP;
    case "KeyQ":
      return KeyCode.LetterQ;
    case "KeyR":
      return KeyCode.LetterR;
    case "KeyS":
      return KeyCode.LetterS;
    case "KeyT":
      return KeyCode.LetterT;
    case "KeyU":
      return KeyCode.LetterU;
    case "KeyV":
      return KeyCode.LetterV;
    case "KeyW":
      return KeyCode.LetterW;
    case "KeyX":
      return KeyCode.LetterX;
    case "KeyY":
      return KeyCode.LetterY;
    case "KeyZ":
      return KeyCode.LetterZ;
    case "BracketLeft":
      return KeyCode.BracketLeft;
    case "BracketRight":
      return KeyCode.BracketRight;
    case "Backslash":
      return KeyCode.Backslash;
    case "CapsLock":
      return KeyCode.CapsLock;
    case "Semicolon":
      return KeyCode.Semicolon;
    case "Quote":
      return KeyCode.Quote;
    case "Enter":
      return KeyCode.Enter;
    case "ShiftLeft":
    case "ShiftRight":
      return KeyCode.Shift;
    case "Comma":
      return KeyCode.Comma;
    case "Period":
      return KeyCode.Period;
    case "Slash":
      return KeyCode.Slash;
    case "ControlLeft":
    case "ControlRight":
      return KeyCode.Control;
    case "AltLeft":
    case "AltRight":
      return KeyCode.Alt;
    case "ArrowUp":
      return KeyCode.ArrowUp;
    case "ArrowDown":
      return KeyCode.ArrowDown;
    case "ArrowLeft":
      return KeyCode.ArrowLeft;
    case "ArrowRight":
      return KeyCode.ArrowRight;
    case "Numpad0":
      return KeyCode.Numpad0;
    case "Numpad1":
      return KeyCode.Numpad1;
    case "Numpad2":
      return KeyCode.Numpad2;
    case "Numpad3":
      return KeyCode.Numpad3;
    case "Numpad4":
      return KeyCode.Numpad4;
    case "Numpad5":
      return KeyCode.Numpad5;
    case "Numpad6":
      return KeyCode.Numpad6;
    case "Numpad7":
      return KeyCode.Numpad7;
    case "Numpad8":
      return KeyCode.Numpad8;
    case "Numpad9":
      return KeyCode.Numpad9;
    case "NumpadAdd":
      return KeyCode.NumpadAdd;
    case "NumpadSubtract":
      return KeyCode.NumpadSubtract;
    case "NumpadMultiply":
      return KeyCode.NumpadMultiply;
    case "NumpadDivide":
      return KeyCode.NumpadDivide;
    case "NumpadSeparator":
      return KeyCode.NumpadSeparator;
    case "NumpadDecimal":
      return KeyCode.NumpadDecimal;
    case "PageDown":
      return KeyCode.PageDown;
    case "PageUp":
      return KeyCode.PageUp;
    /*
     * It's unlikely we'll use thse but we leave it here because it prevents
     * an error from being thrown when the user presses them.
     */
    case "MetaLeft":
    case "MetaRight":
      return KeyCode.Meta;
    default:
      throw Error(
        `Unsupported code: ${code}. Did you pass .code from the keyboard event?`
      );
  }
}

export function sortKeyCodes(keyCodes: KeyCode[]): KeyCode[] {
  let modifiers = [];
  const fns = [];
  const actions = [];
  const arrows = [];
  const letters = [];
  const numbers = [];
  const numpads = [];
  const punctuation = [];

  // Group each key to it's respective group
  for (const key of keyCodes) {
    if (isModifier(key)) modifiers.push(key);
    else if (isFn(key)) fns.push(key);
    else if (isAction(key)) actions.push(key);
    else if (isArrow(key)) arrows.push(key);
    else if (isLetter(key)) letters.push(key);
    else if (isNumber(key)) numbers.push(key);
    else if (isNumpad(key)) numpads.push(key);
    else if (isMisc(key)) punctuation.push(key);
    else throw Error(`Unsupported key ${key} cannot sort.`);
  }

  // Map the values in the array into an object for that O(1) lookup.
  const modifierFlags = modifiers.reduce(
    (accumulator: any, modifier: any) => ({ ...accumulator, [modifier]: true }),
    {}
  );

  const sorted: KeyCode[] = [];
  if (modifierFlags.meta) sorted.push(KeyCode.Meta);
  if (modifierFlags.control) sorted.push(KeyCode.Control);
  if (modifierFlags.shift) sorted.push(KeyCode.Shift);
  if (modifierFlags.alt) sorted.push(KeyCode.Alt);
  modifiers = sorted;

  // TODO: Sort modifiers
  fns.sort((a, b) => {
    const numA = Number.parseInt(a.substring(1), 10);
    const numB = Number.parseInt(b.substring(1), 10);
    return numA - numB;
  });
  actions.sort();
  arrows.sort();
  letters.sort();
  numbers.sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));
  numpads.sort(); // This could cause an edge case but oh well.

  return [
    ...modifiers,
    ...fns,
    ...actions,
    ...arrows,
    ...letters,
    ...numbers,
    ...numpads,
    ...punctuation,
  ];
}

export function isModifier(key: KeyCode) {
  switch (key) {
    case KeyCode.Meta:
    case KeyCode.Control:
    case KeyCode.Alt:
    case KeyCode.Shift:
      return true;
    default:
      return false;
  }
}

export function isNumber(key: KeyCode) {
  // Match #, or # where # = 0 - 9
  return /^\d$/.test(key);
}

export function isLetter(key: KeyCode) {
  // Match a, b, c
  return /^[a-z]$/.test(key);
}

export function isFn(key: KeyCode) {
  // Match f1 - f12
  return /^f([0-9]|1[0-2])$/.test(key);
}

export function isNumpad(key: KeyCode) {
  return /^numpad[\S]+$/.test(key);
}

export function isArrow(key: KeyCode) {
  switch (key) {
    case KeyCode.ArrowLeft:
    case KeyCode.ArrowRight:
    case KeyCode.ArrowUp:
    case KeyCode.ArrowDown:
      return true;
    default:
      return false;
  }
}

export function isAction(key: KeyCode) {
  switch (key) {
    case KeyCode.Insert:
    case KeyCode.Escape:
    case KeyCode.Delete:
    case KeyCode.Backspace:
    case KeyCode.Tab:
    case KeyCode.CapsLock:
    case KeyCode.Enter:
    case KeyCode.Space:
    case KeyCode.PageDown:
    case KeyCode.PageUp:
      return true;
    default:
      return false;
  }
}

// Catch all for random keys not included in other groups.
export function isMisc(key: KeyCode) {
  switch (key) {
    case KeyCode.Backquote:
    case KeyCode.Comma:
    case KeyCode.Period:
    case KeyCode.Minus:
    case KeyCode.Equal:
    case KeyCode.BracketLeft:
    case KeyCode.BracketRight:
    case KeyCode.Backslash:
    case KeyCode.Slash:
    case KeyCode.Semicolon:
    case KeyCode.Quote:
      return true;
    default:
      return false;
  }
}

/**
 * Checks to see if the KeyCode enum contains the passed value.
 * @param key The key code to check.
 * @returns True if the key passed was a valid option.
 */
export function isValidKeyCode(key: string): key is KeyCode {
  return Object.values<string>(KeyCode).includes(key);
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

  return sortKeyCodes(keys);
}

export function keyCodesToString(keys: KeyCode[]): string {
  if (keys.length === 0) {
    throw Error("Shortcut must have at least 1 key");
  }

  if (new Set(keys).size !== keys.length) {
    console.error("Duplicate keys in shortcut: ", keys);
    throw Error("Duplicate keys detected in shortcut");
  }

  const shortcutKeys = sortKeyCodes(keys);
  return shortcutKeys.join(KEYCODE_DELIMITER);
}
