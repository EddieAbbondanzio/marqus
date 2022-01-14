import { getDetails, MouseModifier } from "./mouse";

describe("getDetails()", () => {
  test("returns left click", () => {
    const [button] = getDetails({ button: 0 } as any);
    expect(button).toBe("left");
  });

  test("returns right click", () => {
    const [button] = getDetails({ button: 2 } as any);
    expect(button).toBe("right");
  });

  test("returns shift modifier", () => {
    const [_, modifier] = getDetails({ button: 0, shiftKey: true } as any);
    expect(modifier).toBe(MouseModifier.Shift);
  });

  test("returns control modifier", () => {
    const [_, modifier] = getDetails({ button: 0, ctrlKey: true } as any);
    expect(modifier).toBe(MouseModifier.Control);
  });

  test("returns alt modifier", () => {
    const [_, modifier] = getDetails({ button: 0, altKey: true } as any);
    expect(modifier).toBe(MouseModifier.Alt);
  });

  test("returns meta modifier", () => {
    const [_, modifier] = getDetails({ button: 0, metaKey: true } as any);
    expect(modifier).toBe(MouseModifier.Meta);
  });

  test("returns multiple modifiers", () => {
    const [_, modifier] = getDetails({
      button: 0,
      shiftKey: true,
      ctrlKey: true,
    } as any);
    expect(modifier).toBe(MouseModifier.Shift | MouseModifier.Control);
  });
});
