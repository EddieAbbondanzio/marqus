import { TagMutations } from "@/store/modules/tags/mutations";
import { TagState } from "@/store/modules/tags/state";
import { inject, Mutations } from "vuex-smart-module";

describe("Tag mutations", () => {
  let state: TagState;
  let mutations: TagMutations;

  beforeEach(() => {
    state = {
      values: []
    };

    mutations = inject(TagMutations, {
      state
    });
  });

  describe("SET_STATE", () => {
    it("sets state", () => {
      mutations.SET_STATE({
        values: [
          { id: "1", name: "foo" },
          { id: "2", name: "bar" }
        ]
      });

      expect(state.values).toHaveLength(2);
    });
  });

  describe("CREATE", () => {
    it("throws if name is blank", () => {
      expect(() => {
        mutations.CREATE({
          id: "1",
          name: ""
        });
      }).toThrow();
    });

    it("throws if name is too long", () => {
      expect(() => {
        mutations.CREATE({
          id: "1",
          name:
            "0123456789001234567890012345678900123456789001234567890012345678900123456789001234567890"
        });
      }).toThrow();
    });

    it("creates new tag and adds to state", () => {
      mutations.CREATE({
        id: "1",
        name: "foo"
      });

      expect(state.values[0]).toHaveProperty("id", "1");
      expect(state.values[0]).toHaveProperty("name", "foo");
    });
  });

  describe("RENAME", () => {
    it("throws if name is blank", () => {
      mutations.CREATE({
        id: "1",
        name: "foo"
      });

      expect(() => {
        mutations.RENAME({
          tag: state.values[0],
          newName: ""
        });
      }).toThrow();
    });

    it("throws if name is too long", () => {
      mutations.CREATE({
        id: "1",
        name: "foo"
      });

      expect(() => {
        mutations.RENAME({
          tag: state.values[0],
          newName:
            "0123456789001234567890012345678900123456789001234567890012345678900123456789001234567890"
        });
      }).toThrow();
    });

    it("sets new name", () => {
      mutations.CREATE({
        id: "1",
        name: "foo"
      });

      mutations.RENAME({
        tag: state.values[0],
        newName: "bar"
      });

      expect(state.values[0]).toHaveProperty("name", "bar");
    });
  });

  describe("DELETE", () => {
    it("throws if tag is not found", () => {
      expect(() => {
        mutations.DELETE({ id: "1", name: "cat" });
      }).toThrow();
    });

    it("removes tag from state", () => {
      mutations.CREATE({
        id: "1",
        name: "foo"
      });

      mutations.CREATE({
        id: "2",
        name: "bar"
      });

      mutations.DELETE({ id: "1", name: "foo" });

      expect(state.values).toHaveLength(1);
      expect(state.values[0]).toHaveProperty("id", "2");
    });
  });

  describe("DELETE_ALL", () => {
    it("removes every tag", () => {
      mutations.CREATE({
        id: "1",
        name: "foo"
      });

      mutations.CREATE({
        id: "2",
        name: "bar"
      });

      mutations.DELETE_ALL();

      expect(state.values).toHaveLength(0);
    });
  });

  describe("SORT", () => {
    it("sorts alphabetically", () => {
      mutations.CREATE({
        id: "1",
        name: "foo"
      });

      mutations.CREATE({
        id: "2",
        name: "bar"
      });

      mutations.CREATE({
        id: "3",
        name: "baz"
      });

      mutations.SORT();

      expect(state.values[0]).toHaveProperty("id", "2");
      expect(state.values[1]).toHaveProperty("id", "3");
      expect(state.values[2]).toHaveProperty("id", "1");
    });
  });
});
