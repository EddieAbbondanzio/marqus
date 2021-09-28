import { getButton } from "@/utils/mouse/mouse-button";

describe("getButton", () => {
  it("returns left for 0", () => {
    expect(getButton(0)).toBe("left");
  });

  it("returns right for 2", () => {
    expect(getButton(2)).toBe("right");
  });

  it("defaults to either", () => {
    expect(getButton(13)).toBe("either");
  });
});
