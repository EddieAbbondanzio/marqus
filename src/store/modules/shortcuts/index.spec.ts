import { DEFAULT_SHORTCUTS } from "@/utils/shortcuts/default-shortcuts";
import { KeyCode } from "@/utils/shortcuts/key-code";
import { Shortcut } from "@/utils/shortcuts/shortcut";
import { reviver, transformer } from "@/store/modules/shortcuts";
import { ShortcutState } from "@/store/modules/shortcuts/state";

describe("transformer()", () => {
  it("only returns user defined shortcuts", () => {
    const state: ShortcutState = {
      values: [
        new Shortcut("foo", [KeyCode.Space], true),
        new Shortcut("bar", [KeyCode.Delete])
      ]
    };

    const transformed = transformer(state);
    expect(transformed.values).toHaveLength(1);
  });

  it("converts keys to string", () => {
    const state: ShortcutState = {
      values: [
        new Shortcut("foo", [KeyCode.Space, KeyCode.Slash], true),
        new Shortcut("bar", [KeyCode.Delete])
      ]
    };

    const transformed = transformer(state);
    expect(transformed.values[0].keys).toBe("space+/");
  });
});

describe("reviver()", () => {
  it("retains default shortcuts", () => {
    const revived = reviver({ values: [] });

    expect(revived.values).toHaveLength(DEFAULT_SHORTCUTS.length);
  });

  it("replaces default shortcuts with user defined ones.", () => {
    const revived = reviver({ values: [{ name: "delete", keys: "space" }] });

    const deleteSC = revived.values.find(s => s.name === "delete");
    expect(deleteSC?.keys).toEqual([KeyCode.Space]);
  });
});
