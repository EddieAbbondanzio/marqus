import {
  parseKeyCode,
  isModifier,
  KeyCode,
  isValidKeyCode,
  isNumber,
  isNumpad,
  isLetter,
  isFn,
  isArrow,
  isAction,
  keyCodesToString,
  sortKeyCodes,
} from "../../../src/shared/io/keyCode";

test.each([
  ["Space", KeyCode.Space],
  ["Escape", KeyCode.Escape],
  ["Insert", KeyCode.Insert],
  ["Delete", KeyCode.Delete],
  ["Backquote", KeyCode.Backquote],
  ["Minus", KeyCode.Minus],
  ["Equal", KeyCode.Equal],
  ["Backspace", KeyCode.Backspace],
  ["Tab", KeyCode.Tab],
  ["BracketLeft", KeyCode.BracketLeft],
  ["BracketRight", KeyCode.BracketRight],
  ["Backslash", KeyCode.Backslash],
  ["CapsLock", KeyCode.CapsLock],
  ["Quote", KeyCode.Quote],
  ["Enter", KeyCode.Enter],
  ["ShiftLeft", KeyCode.Shift],
  ["ShiftRight", KeyCode.Shift],
  ["Comma", KeyCode.Comma],
  ["Period", KeyCode.Period],
  ["Slash", KeyCode.Slash],
  ["ControlLeft", KeyCode.Control],
  ["ControlRight", KeyCode.Control],
  ["AltLeft", KeyCode.Alt],
  ["AltRight", KeyCode.Alt],
  ["ArrowUp", KeyCode.ArrowUp],
  ["ArrowDown", KeyCode.ArrowDown],
  ["ArrowLeft", KeyCode.ArrowLeft],
  ["ArrowRight", KeyCode.ArrowRight],
  ["NumpadAdd", KeyCode.NumpadAdd],
  ["NumpadSubtract", KeyCode.NumpadSubtract],
  ["NumpadMultiply", KeyCode.NumpadMultiply],
  ["NumpadDivide", KeyCode.NumpadDivide],
  ["NumpadSeparator", KeyCode.NumpadSeparator],
  ["NumpadDecimal", KeyCode.NumpadDecimal],
  ["PageUp", KeyCode.PageUp],
  ["PageDown", KeyCode.PageDown],
])("parseKey (key: %s)", (raw, code) => {
  expect(parseKeyCode(raw)).toBe(code);
});

test("parseKey f keys", () => {
  for (let i = 1; i <= 12; i++) {
    expect(parseKeyCode(`F${i}`)).toBe(`f${i}`);
  }
});

test("parseKey digits", () => {
  for (let i = 0; i <= 9; i++) {
    expect(parseKeyCode(`Digit${i}`)).toBe(i.toString());
  }
});

test("parseKey alphabet letters", () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  for (const letter of alphabet) {
    expect(parseKeyCode(`Key${letter}`)).toBe(letter.toLowerCase());
  }
});

test("parseKey numpad digits", () => {
  for (let i = 0; i <= 9; i++) {
    expect(parseKeyCode(`Numpad${i}`)).toBe(`numpad${i}`);
  }
});

test("isValidKeyCode true for valid key codes", () => {
  expect(isValidKeyCode(KeyCode.LetterX)).toBeTruthy();
});

test("isValidKeyCode false for non key codes", () => {
  expect(isValidKeyCode("cat")).toBeFalsy();
});

test.each([KeyCode.Meta, KeyCode.Control, KeyCode.Alt, KeyCode.Shift])(
  "isModifier true for %s",
  keyCode => {
    expect(isModifier(keyCode)).toBe(true);
  },
);

test("isModifier false for rando", () => {
  expect(isModifier(KeyCode.LetterI)).toBe(false);
});

test.each([
  KeyCode.Digit0,
  KeyCode.Digit1,
  KeyCode.Digit2,
  KeyCode.Digit3,
  KeyCode.Digit4,
  KeyCode.Digit5,
  KeyCode.Digit6,
  KeyCode.Digit7,
  KeyCode.Digit8,
  KeyCode.Digit9,
])("isNumber true for %s", key => {
  expect(isNumber(key)).toBe(true);
});

test.each([KeyCode.Numpad3, KeyCode.Shift, KeyCode.Period])(
  "isNumber is false for %s",
  key => {
    expect(isNumber(key)).toBe(false);
  },
);

test.each([
  KeyCode.LetterA,
  KeyCode.LetterB,
  KeyCode.LetterC,
  KeyCode.LetterD,
  KeyCode.LetterE,
  KeyCode.LetterF,
  KeyCode.LetterG,
  KeyCode.LetterH,
  KeyCode.LetterI,
  KeyCode.LetterJ,
  KeyCode.LetterK,
  KeyCode.LetterL,
  KeyCode.LetterM,
  KeyCode.LetterN,
  KeyCode.LetterO,
  KeyCode.LetterP,
  KeyCode.LetterQ,
  KeyCode.LetterR,
  KeyCode.LetterS,
  KeyCode.LetterT,
  KeyCode.LetterU,
  KeyCode.LetterV,
  KeyCode.LetterW,
  KeyCode.LetterX,
  KeyCode.LetterY,
  KeyCode.LetterZ,
])("isLetter true for %s", key => {
  expect(isLetter(key)).toBe(true);
});

test.each([KeyCode.Numpad2, KeyCode.Digit5, KeyCode.Control])(
  "isLetter false for %s",
  key => {
    expect(isLetter(key)).toBe(false);
  },
);

test.each([
  KeyCode.F1,
  KeyCode.F2,
  KeyCode.F3,
  KeyCode.F4,
  KeyCode.F5,
  KeyCode.F6,
  KeyCode.F7,
  KeyCode.F8,
  KeyCode.F9,
  KeyCode.F10,
  KeyCode.F11,
  KeyCode.F12,
])("isFn true for %s", key => {
  expect(isFn(key)).toBe(true);
});

test.each([KeyCode.LetterA, KeyCode.Meta, KeyCode.Minus])(
  "isFn false for",
  key => {
    expect(isFn(key)).toBe(false);
  },
);

test.each([
  KeyCode.Numpad0,
  KeyCode.Numpad1,
  KeyCode.Numpad2,
  KeyCode.Numpad3,
  KeyCode.Numpad4,
  KeyCode.Numpad5,
  KeyCode.Numpad6,
  KeyCode.Numpad7,
  KeyCode.Numpad8,
  KeyCode.Numpad9,
  KeyCode.Numpad0,
  KeyCode.NumpadAdd,
  KeyCode.NumpadDecimal,
  KeyCode.NumpadDivide,
  KeyCode.NumpadMultiply,
  KeyCode.NumpadSeparator,
  KeyCode.NumpadSubtract,
])("isNumpadis true for %s", key => {
  expect(isNumpad(key)).toBe(true);
});

test.each([KeyCode.LetterA, KeyCode.Digit5, KeyCode.Alt])(
  "isNumpad is false for %s",
  key => {
    expect(isNumpad(key)).toBe(false);
  },
);

test.each([
  KeyCode.ArrowUp,
  KeyCode.ArrowDown,
  KeyCode.ArrowLeft,
  KeyCode.ArrowRight,
])("isArrowis true for %s", key => {
  expect(isArrow(key)).toBe(true);
});

test.each([KeyCode.Numpad0, KeyCode.LetterA, KeyCode.NumpadSeparator])(
  "isArrow is false for %s",
  key => {
    expect(isArrow(key)).toBe(false);
  },
);

test.each([
  KeyCode.Insert,
  KeyCode.Escape,
  KeyCode.Delete,
  KeyCode.Backspace,
  KeyCode.Tab,
  KeyCode.CapsLock,
  KeyCode.Enter,
  KeyCode.Space,
  KeyCode.PageDown,
  KeyCode.PageUp,
])("isAction is true for %s", key => {
  expect(isAction(key)).toBe(true);
});

test.each([KeyCode.NumpadMultiply, KeyCode.LetterH, KeyCode.Meta])(
  "isAction is false for %s",
  key => {
    expect(isAction(key)).toBe(false);
  },
);

test("sortKeyCodes handles every expected key", () => {
  const everyKey = Object.values(KeyCode);
  expect(() => {
    sortKeyCodes(everyKey);
  }).not.toThrow();
});

test.each(["cat", "ctrl*1", ""])(
  "parseKeyCodes returns null for unknown keys %s",
  keyString => {
    expect(parseKeyCode(keyString)).toBe(null);
  },
);

test("keyCodesToString works", () => {
  expect(keyCodesToString([KeyCode.LetterH, KeyCode.Control])).toBe(
    "control+h",
  );
});
