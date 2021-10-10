import { notebooks } from "@/store/modules/notebooks";

describe("notebooks", () => {
  it("sets namespaced as true", () => {
    expect(notebooks.options.namespaced).toBeTruthy();
  });
});
