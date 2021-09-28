import { tags } from "@/store/modules/tags";

describe("Tag vuex module", () => {
  it("is namespaced", () => {
    expect(tags.options.namespaced).toBeTruthy();
  });
});
