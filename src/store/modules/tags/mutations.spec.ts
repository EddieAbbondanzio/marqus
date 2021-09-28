import { TagMutations } from "@/store/modules/tags/mutations";
import { TagState } from "@/store/modules/tags/state";
import { generateId } from "@/utils/id";
import { inject } from "vuex-smart-module";

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
          { id: "1", name: "foo", created: new Date() },
          { id: "2", name: "bar", created: new Date() }
        ]
      });

      expect(state.values).toHaveLength(2);
    });
  });

  describe("CREATE", () => {
    it("throws if name is blank", () => {
      expect(() => {
        mutations.CREATE({
          name: ""
        });
      }).toThrow();
    });

    it("throws if name is too long", () => {
      expect(() => {
        mutations.CREATE({
          name:
            "0123456789001234567890012345678900123456789001234567890012345678900123456789001234567890"
        });
      }).toThrow();
    });

    it("creates new tag and adds to state", () => {
      mutations.CREATE({
        name: "foo"
      });

      expect(state.values[0]).toHaveProperty("id");
      expect(state.values[0]).toHaveProperty("name", "foo");
    });
  });

  describe("RENAME", () => {
    it("throws if name is blank", () => {
      mutations.CREATE({
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
        mutations.DELETE({ id: generateId(), name: "cat", created: new Date() });
      }).toThrow();
    });

    it("removes tag from state", () => {
      const idToDelete = generateId();

      mutations.CREATE({
        id: idToDelete,
        name: "foo"
      });

      const notDeleteId = generateId();

      mutations.CREATE({
        id: notDeleteId,
        name: "bar"
      });

      mutations.DELETE({ id: idToDelete, name: "foo", created: new Date() });

      expect(state.values).toHaveLength(1);
      expect(state.values[0]).toHaveProperty("id", notDeleteId);
    });
  });

  describe("DELETE_ALL", () => {
    it("removes every tag", () => {
      mutations.CREATE({
        name: "foo"
      });

      mutations.CREATE({
        name: "bar"
      });

      mutations.DELETE_ALL();

      expect(state.values).toHaveLength(0);
    });
  });

  describe("SORT", () => {
    it("sorts alphabetically", () => {
      mutations.CREATE({
        name: "foo"
      });

      mutations.CREATE({
        name: "bar"
      });

      mutations.CREATE({
        name: "baz"
      });

      mutations.SORT();

      expect(state.values[0]).toHaveProperty("name", "bar");
      expect(state.values[1]).toHaveProperty("name", "baz");
      expect(state.values[2]).toHaveProperty("name", "foo");
    });
  });
});
