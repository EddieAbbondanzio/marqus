import { parseKeyCode, isModifier, KeyCode, isValidKeyCode } from "./keyCode";

describe("parseKey()", () => {
  it("returns space", () => {
    expect(parseKeyCode("Space")).toBe("space");
  });

  it("returns escape", () => {
    expect(parseKeyCode("Escape")).toBe("esc");
  });

  it("returns f keys", () => {
    for (let i = 1; i <= 12; i++) {
      expect(parseKeyCode(`F${i}`)).toBe(`f${i}`);
    }
  });

  it("returns insert", () => {
    expect(parseKeyCode("Insert")).toBe("insert");
  });

  it("returns delete", () => {
    expect(parseKeyCode("Delete")).toBe("delete");
  });

  it("returns backquote", () => {
    expect(parseKeyCode("Backquote")).toBe("`");
  });

  it("returns digits", () => {
    for (let i = 0; i <= 9; i++) {
      expect(parseKeyCode(`Digit${i}`)).toBe(i.toString());
    }
  });

  it("returns minus", () => {
    expect(parseKeyCode("Minus")).toBe("-");
  });

  it("returns equal", () => {
    expect(parseKeyCode("Equal")).toBe("=");
  });

  it("returns backspace", () => {
    expect(parseKeyCode("Backspace")).toBe("backspace");
  });

  it("returns tab", () => {
    expect(parseKeyCode("Tab")).toBe("tab");
  });

  it("returns alphabet letters", () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    for (const letter of alphabet) {
      expect(parseKeyCode(`Key${letter}`)).toBe(letter.toLowerCase());
    }
  });

  it("returns left bracket", () => {
    expect(parseKeyCode("BracketLeft")).toBe("[");
  });

  it("returns right bracket", () => {
    expect(parseKeyCode("BracketRight")).toBe("]");
  });

  it("returns back slash", () => {
    expect(parseKeyCode("Backslash")).toBe("\\");
  });

  it("returns caps lock", () => {
    expect(parseKeyCode("CapsLock")).toBe("capslock");
  });

  it("returns semicolon", () => {
    expect(parseKeyCode("Semicolon")).toBe(";");
  });

  it("returns quote", () => {
    expect(parseKeyCode("Quote")).toBe("'");
  });

  it("returns enter", () => {
    expect(parseKeyCode("Enter")).toBe("enter");
  });

  it("returns shift", () => {
    expect(parseKeyCode("ShiftLeft")).toBe("shift");
    expect(parseKeyCode("ShiftRight")).toBe("shift");
  });

  it("returns comma", () => {
    expect(parseKeyCode("Comma")).toBe(",");
  });

  it("returns period", () => {
    expect(parseKeyCode("Period")).toBe(".");
  });

  it("returns slash", () => {
    expect(parseKeyCode("Slash")).toBe("/");
  });

  it("returns control", () => {
    expect(parseKeyCode("ControlLeft")).toBe("control");
    expect(parseKeyCode("ControlRight")).toBe("control");
  });

  it("returns alt", () => {
    expect(parseKeyCode("AltLeft")).toBe("alt");
    expect(parseKeyCode("AltRight")).toBe("alt");
  });

  it("returns arrows", () => {
    expect(parseKeyCode("ArrowUp")).toBe("up");
    expect(parseKeyCode("ArrowDown")).toBe("down");
    expect(parseKeyCode("ArrowLeft")).toBe("left");
    expect(parseKeyCode("ArrowRight")).toBe("right");
  });

  it("returns numpad digits", () => {
    for (let i = 0; i <= 9; i++) {
      expect(parseKeyCode(`Numpad${i}`)).toBe(`numpad${i}`);
    }
  });

  it("returns numpad add", () => {
    expect(parseKeyCode("NumpadAdd")).toBe("numpad_add");
  });

  it("returns numpad subtract", () => {
    expect(parseKeyCode("NumpadSubtract")).toBe("numpad_subtract");
  });

  it("returns numpad multiply", () => {
    expect(parseKeyCode("NumpadMultiply")).toBe("numpad_multiply");
  });

  it("returns numpad divide", () => {
    expect(parseKeyCode("NumpadDivide")).toBe("numpad_divide");
  });

  it("returns numpad_separator", () => {
    expect(parseKeyCode("NumpadSeparator")).toBe("numpad_separator");
  });

  it("returns numpad decimal", () => {
    expect(parseKeyCode("NumpadDecimal")).toBe("numpad_decimal");
  });

  it("returns page up", () => {
    expect(parseKeyCode("PageUp")).toBe("page_up");
  });

  it("returns page down", () => {
    expect(parseKeyCode("PageDown")).toBe("page_down");
  });
});

describe("isModifier()", () => {
  it("returns true for control", () => {
    expect(isModifier(KeyCode.Control)).toBeTruthy();
  });

  it("returns true for alt", () => {
    expect(isModifier(KeyCode.Alt)).toBeTruthy();
  });

  it("returns true for shift", () => {
    expect(isModifier(KeyCode.Shift)).toBeTruthy();
  });

  it("returns false for else", () => {
    expect(isModifier(KeyCode.LetterW)).toBeFalsy();
  });
});

describe("isValidKeyCode()", () => {
  it("returns true for valid key codes", () => {
    expect(isValidKeyCode(KeyCode.LetterX)).toBeTruthy();
  });

  it("returns false for non key codes", () => {
    expect(isValidKeyCode("cat")).toBeFalsy();
  });
});
