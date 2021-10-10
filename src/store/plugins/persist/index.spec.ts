import { getModuleFileName, persist } from "@/store/plugins/persist";

describe("Persist plugin", () => {
  beforeEach(() => {
    persist.modules.length = 0;
  });

  describe("register()", () => {
    it("throws error on duplicate module.", () => {
      persist.modules.push({
        settings: {
          namespace: "cat",
          setStateAction: ""
        }
      });

      expect(() => {
        persist.register({
          namespace: "cat",
          setStateAction: ""
        });
      }).toThrow();
    });

    it("adds module to modules array", () => {
      persist.register({
        namespace: "cat",
        setStateAction: "SET_STATE"
      });

      expect(persist.modules).toHaveLength(1);
      expect(persist.modules[0].settings).toHaveProperty("namespace", "cat");
    });
  });

  describe("getModuleFileName()", () => {
    it("returns fileName if defined", () => {
      const name = getModuleFileName({
        settings: { namespace: "cat", fileName: "dog.json", setStateAction: "" }
      });

      expect(name).toBe("dog.json");
    });

    it("returns namespace if no fileName specified.", () => {
      const name = getModuleFileName({
        settings: { namespace: "cat", setStateAction: "" }
      });

      expect(name).toBe("cat.json");
    });

    it("returns deepest namespace if nested namespace", () => {
      const name = getModuleFileName({
        settings: { namespace: "super/nested/cat", setStateAction: "" }
      });

      expect(name).toBe("cat.json");
    });
  });
});
