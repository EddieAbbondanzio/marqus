import {
  DEFAULT_CURSOR,
  getDetails,
  MouseController,
  MouseModifier,
} from "./mouse";

describe("MouseController", () => {
  beforeEach(() => {
    document.body.style.cursor = "auto";
  });

  test("it adds click listeners", () => {
    const c = new MouseController();
    const cb = jest.fn();

    c.listen({ event: "click", modifier: MouseModifier.Control }, cb);
    expect(c.listeners["click"]).toEqual({
      callback: cb,
      button: "left",
      modifier: MouseModifier.Control,
    });
  });

  test("it adds other listeners", () => {
    const c = new MouseController();
    const cb = jest.fn();

    c.listen({ event: "dragEnd" }, cb);
    expect(c.listeners["dragEnd"]).toEqual({
      callback: cb,
    });
  });

  test("it defaults click listener opts", () => {
    const c = new MouseController();
    const cb = jest.fn();
    c.listen({ event: "click" }, cb);

    const listener = c.listeners["click"];
    expect(listener).not.toBe(null);
    expect(listener!.button).toBe("left");
    expect(listener!.modifier).toBe(MouseModifier.None);
  });

  test("it notifies listeners", () => {
    const c = new MouseController();
    const cb = jest.fn();

    c.listen({ event: "click" }, cb);
    expect(c.listeners["click"]).toEqual({
      callback: cb,
      button: "left",
      modifier: MouseModifier.None,
    });
    c.notify({} as any, "click", "left");
    expect(cb).toHaveBeenCalled();
  });

  test("it skips listeners with the wrong button", () => {
    const c = new MouseController();
    const cb = jest.fn();

    c.listen({ event: "click", button: "right" }, cb);
    expect(c.listeners["click"]).toEqual({
      callback: cb,
      button: "right",
      modifier: MouseModifier.None,
    });
    c.notify({} as any, "click", "left");
    expect(cb).not.toHaveBeenCalled();
  });

  test("it skips if wrong modifier", () => {
    const c = new MouseController();
    const cb = jest.fn();

    c.listen({ event: "click" }, cb);
    expect(c.listeners["click"]).toEqual({
      callback: cb,
      button: "left",
      modifier: MouseModifier.None,
    });
    c.notify({} as any, "click", "left", MouseModifier.Control);
    expect(cb).not.toHaveBeenCalled();
  });

  test("it temporary overrides cursor", async () => {
    const cont = new MouseController();
    document.body.style.cursor = "copy";
    await cont.cursor("move", async () => {
      expect(document.body.style.cursor).toBe("move");
    });
    expect(document.body.style.cursor).toBe("copy");
  });

  test("it sets cursor", () => {
    const cont = new MouseController();
    cont.setCursor("ew-resize");
    expect(document.body.style.cursor).toBe("ew-resize");
  });

  test("it resets cursor", () => {
    const cont = new MouseController();
    document.body.style.cursor = "ew-resize";
    cont.resetCursor();
    expect(document.body.style.cursor).toBe(DEFAULT_CURSOR);
  });
});

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
