import { classList } from "../../src/shared/dom";

describe("classList()", () => {
  test("it skips nulls and undefined", () => {
    const classes = classList("foo", undefined, null!, "bar");
    expect(classes).toBe("foo bar");
  });

  test("it omits conditionals with a false value", () => {
    const classes = classList("foo", { bar: false, baz: true });
    expect(classes).toBe("foo baz");
  });
});
