import { deepUpdate } from "./deepUpdate";

describe("deepUpdate()", () => {
  test("updates props", () => {
    const obj = {
      a: 1,
      b: 2,
    };

    const updates = {
      b: 3,
    };

    expect(deepUpdate(obj, updates)).toEqual({ a: 1, b: 3 });
  });

  test("deletes props", () => {
    const obj = {
      a: 1,
      b: 2,
    };

    const upd = {
      b: undefined,
    };

    const newObj = deepUpdate(obj, upd);
    expect(newObj).toHaveProperty("a", 1);
    expect(newObj).not.toHaveProperty("b");
  });

  test("works with nested objects", () => {
    const obj = {
      a: 1,
      b: 2,
      foo: {
        c: 3,
        d: 4,
        bar: {
          e: 5,
          f: 6,
        },
      },
    };

    const upd: any = {
      a: "a",
      foo: {
        d: undefined,
        bar: {
          e: "e",
        },
      },
    };

    const newObj = deepUpdate(obj, upd);
    expect(newObj).toEqual({
      a: "a",
      b: 2,
      foo: {
        c: 3,
        bar: {
          e: "e",
          f: 6,
        },
      },
    });
  });

  test("retains properties without updates", () => {
    const obj = {
      foo: {
        a: 1,
      },
      bar: {
        b: 2,
      },
    };

    const upd = {
      bar: {
        b: 3,
      },
    };

    const newObj = deepUpdate(obj, upd);
    expect(newObj).toEqual({
      foo: { a: 1 },
      bar: { b: 3 },
    });
  });

  test("complex scenario", () => {
    const obj = {
      a: 1,
      b: 2,
      foo: {
        c: 3,
        d: 4,
        bar: {
          e: 5,
          f: 6,
        },
        baz: {
          g: 7,
          h: 8,
        },
        flaz: {
          i: 9,
          j: 10,
          blorz: {
            k: 11,
          },
        },
      },
    };

    const upd = {
      a: undefined,
      foo: {
        bar: {
          e: undefined,
          f: 7,
        },
        flaz: {
          blorz: {
            k: undefined,
          },
        },
      },
    };

    const newObj = deepUpdate(obj, upd);
    expect(newObj).toEqual({
      b: 2,
      foo: {
        c: 3,
        d: 4,
        bar: {
          f: 7,
        },
        baz: {
          g: 7,
          h: 8,
        },
        flaz: {
          i: 9,
          j: 10,
          blorz: {},
        },
      },
    });
  });
});
