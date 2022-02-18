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

describe("parseKey()", () => {
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
  ]);

  test("f keys", () => {
    for (let i = 1; i <= 12; i++) {
      expect(parseKeyCode(`F${i}`)).toBe(`f${i}`);
    }
  });

  test("digits", () => {
    for (let i = 0; i <= 9; i++) {
      expect(parseKeyCode(`Digit${i}`)).toBe(i.toString());
    }
  });

  test("alphabet letters", () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    for (const letter of alphabet) {
      expect(parseKeyCode(`Key${letter}`)).toBe(letter.toLowerCase());
    }
  });

  test("numpad digits", () => {
    for (let i = 0; i <= 9; i++) {
      expect(parseKeyCode(`Numpad${i}`)).toBe(`numpad${i}`);
    }
  });
});

describe("isValidKeyCode()", () => {
  test("true for valid key codes", () => {
    expect(isValidKeyCode(KeyCode.LetterX)).toBeTruthy();
  });

  test("false for non key codes", () => {
    expect(isValidKeyCode("cat")).toBeFalsy();
  });
});

describe("isModifier()", () => {
  test.each([KeyCode.Meta, KeyCode.Control, KeyCode.Alt, KeyCode.Shift])(
    "true for %s",
    (keyCode) => {
      expect(isModifier(keyCode)).toBe(true);
    }
  );

  test("false for rando", () => {
    expect(isModifier(KeyCode.LetterI)).toBe(false);
  });
});

describe("isNumber()", () => {
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
  ])("true for %s", (key) => {
    expect(isNumber(key)).toBe(true);
  });

  test.each([KeyCode.Numpad3, KeyCode.Shift, KeyCode.Period])(
    "is false for %s",
    (key) => {
      expect(isNumber(key)).toBe(false);
    }
  );
});

describe("isLetter()", () => {
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
  ])("true for %s", (key) => {
    expect(isLetter(key)).toBe(true);
  });

  test.each([KeyCode.Numpad2, KeyCode.Digit5, KeyCode.Control])(
    "false for %s",
    (key) => {
      expect(isLetter(key)).toBe(false);
    }
  );
});

describe("isFn()", () => {
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
  ])("true for %s", (key) => {
    expect(isFn(key)).toBe(true);
  });

  test.each([KeyCode.LetterA, KeyCode.Meta, KeyCode.Minus])(
    "false for",
    (key) => {
      expect(isFn(key)).toBe(false);
    }
  );
});

describe("isNumpad()", () => {
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
  ])("is true for %s", (key) => {
    expect(isNumpad(key)).toBe(true);
  });

  test.each([KeyCode.LetterA, KeyCode.Digit5, KeyCode.Alt])(
    "is false for %s",
    (key) => {
      expect(isNumpad(key)).toBe(false);
    }
  );
});

describe("isArrow()", () => {
  test.each([
    KeyCode.ArrowUp,
    KeyCode.ArrowDown,
    KeyCode.ArrowLeft,
    KeyCode.ArrowRight,
  ])("is true for %s", (key) => {
    expect(isArrow(key)).toBe(true);
  });

  test.each([KeyCode.Numpad0, KeyCode.LetterA, KeyCode.NumpadSeparator])(
    "is false for %s",
    (key) => {
      expect(isArrow(key)).toBe(false);
    }
  );
});

describe("isAction()", () => {
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
  ])("is true for %s", (key) => {
    expect(isAction(key)).toBe(true);
  });

  test.each([KeyCode.NumpadMultiply, KeyCode.LetterH, KeyCode.Meta])(
    "is false for %s",
    (key) => {
      expect(isAction(key)).toBe(false);
    }
  );
});

describe("sortKeyCodes()", () => {
  test("handles every expected key", () => {
    const everyKey = Object.values(KeyCode);
    expect(() => {
      sortKeyCodes(everyKey);
    }).not.toThrow();
  });
});

describe("parseKeyCodes()", () => {
  test.each(["cat", "ctrl*1", ""])("throws %s", (keyString) => {
    expect(() => parseKeyCode(keyString)).toThrow();
  });
});

describe("keyCodesToString()", () => {
  test("works", () => {
    expect(keyCodesToString([KeyCode.LetterH, KeyCode.Control])).toBe(
      "control+h"
    );
  });
});
