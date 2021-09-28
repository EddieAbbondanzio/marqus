import { DirectiveBinding } from "vue";
import {
  mouse,
  mouseObjectManager,
  getAction,
  getCallback,
  getButton
} from "./mouse";

describe("v-mouse", () => {
  describe("beforeMount()", () => {
    it("creates MouseObject for element", () => {
      const el = document.createElement("a");
      const binding = ({
        arg: "click",
        value: () => {},
        modifiers: { left: true }
      } as any) as DirectiveBinding;

      mouse.beforeMount(el, binding);
      expect(mouseObjectManager.objects).toHaveLength(1);
    });
  });
});

describe("getAction()", () => {
  it("accepts click", () => {
    expect(getAction("click")).toBe("click");
  });

  it("accepts hold", () => {
    expect(getAction("hold")).toBe("hold");
  });

  it("accepts release", () => {
    expect(getAction("release")).toBe("release");
  });

  it("accepts drag", () => {
    expect(getAction("drag")).toBe("drag");
  });

  it("throws on all else", () => {
    expect(() => getAction("foo")).toThrow();
  });
});

describe("getButton()", () => {
  it("returns left", () => {
    expect(getButton({ left: true })).toBe("left");
  });

  it("returns right", () => {
    expect(getButton({ right: true })).toBe("right");
  });

  it("defaults to either", () => {
    expect(getButton({})).toBe("either");
  });
});

describe("getCallback()", () => {
  it("throws error if value is not a function", () => {
    expect(() => {
      getCallback(1);
    }).toThrow();
  });

  it("accepts functions", () => {
    expect(getCallback(() => {})).toBeTruthy();
  });
});
