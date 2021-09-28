import { NotebookMutations } from "@/store/modules/notebooks/mutations";
import { NotebookState } from "@/store/modules/notebooks/state";
import { inject } from "vuex-smart-module";

describe("Notebook mutations", () => {
  let state: NotebookState;
  let mutations: NotebookMutations;

  beforeEach(() => {
    state = {
      values: []
    };

    mutations = inject(NotebookMutations, { state });
  });

  describe("SET_STATE", () => {
    it("sets state", () => {
      const newState = {
        values: [{ id: "1", name: "foo" }]
      };

      mutations.SET_STATE(newState);
    });
  });

  describe("CREATE", () => {
    it("throws if name is blank", () => {
      expect(() => {
        mutations.CREATE({
          value: {
            id: "1",
            name: null!
          }
        });
      }).toThrow();
    });

    it("throws if name is too long", () => {
      expect(() => {
        mutations.CREATE({
          value: {
            id: "1",
            name:
              "012345678900123456789001234567890012345678900123456789001234567890"
          }
        });
      }).toThrow();
    });

    it("creates a new notebook", () => {
      mutations.CREATE({
        value: {
          id: "1",
          name: "foo"
        }
      });

      expect(state.values).toHaveLength(1);
      expect(state.values[0]).toHaveProperty("id", "1");
      expect(state.values[0]).toHaveProperty("name", "foo");
    });

    it("assigns parent", () => {
      mutations.CREATE({
        value: {
          id: "1",
          name: "foo"
        }
      });

      const parent = state.values[0];

      mutations.CREATE({
        value: {
          id: "2",
          name: "bar",
          parent
        }
      });

      expect(parent.children).toHaveLength(1);
      expect(state.values).toHaveLength(1);
      expect(parent.children![0].parent).toBe(parent);
    });
  });

  describe("SET_NAME", () => {
    it("throws if name is blank", () => {
      mutations.CREATE({
        value: {
          id: "1",
          name: "foo"
        }
      });

      const notebook = state.values[0];

      expect(() => {
        mutations.SET_NAME({
          value: {
            notebook,
            newName: null!
          }
        });
      }).toThrow();
    });

    it("throws if name is too long", () => {
      mutations.CREATE({
        value: {
          id: "1",
          name: "foo"
        }
      });

      const notebook = state.values[0];

      expect(() => {
        mutations.SET_NAME({
          value: {
            notebook,
            newName:
              "012345678900123456789001234567890012345678900123456789001234567890"
          }
        });
      }).toThrow();
    });
  });

  describe("DELETE", () => {
    it("throws if notebook is not in state", () => {
      expect(() => {
        mutations.DELETE({ value: { id: "1", name: "foo" } });
      }).toThrow();
    });

    it("removes notebook", () => {
      mutations.CREATE({
        value: {
          id: "1",
          name: "foo"
        }
      });

      const notebook = state.values[0];

      mutations.DELETE({ value: notebook });
      expect(state.values).toHaveLength(0);
    });

    it("removes from .children of parent if nested", () => {
      mutations.CREATE({
        value: {
          id: "1",
          name: "foo"
        }
      });

      const parent = state.values[0];

      mutations.CREATE({
        value: {
          id: "2",
          name: "bar",
          parent
        }
      });

      mutations.DELETE({ value: parent.children![0] });

      expect(parent.children).toBeUndefined();
    });
  });

  describe("DELETE_ALL", () => {
    it("removes all notebooks", () => {
      mutations.CREATE({
        value: {
          id: "1",
          name: "foo"
        }
      });

      mutations.CREATE({
        value: {
          id: "2",
          name: "bar"
        }
      });

      mutations.DELETE_ALL({});

      expect(state.values).toHaveLength(0);
    });
  });

  describe("SET_EXPANDED", () => {
    it("sets expanded", () => {
      mutations.CREATE({
        value: {
          id: "1",
          name: "foo"
        }
      });

      const notebook = state.values[0];

      mutations.SET_EXPANDED({
        value: {
          notebook,
          expanded: true,
          bubbleUp: false
        }
      });

      expect(notebook.expanded).toBeTruthy();
    });

    it("bubbles up if desired", () => {
      mutations.CREATE({
        value: {
          id: "1",
          name: "foo"
        }
      });

      const parent = state.values[0];

      mutations.CREATE({
        value: {
          id: "2",
          name: "bar",
          parent
        }
      });

      const notebook = parent.children![0];

      mutations.SET_EXPANDED({
        value: {
          notebook,
          expanded: true,
          bubbleUp: true
        }
      });

      expect(parent.expanded).toBeTruthy();
      expect(notebook.expanded).toBeTruthy();
    });
  });

  describe("SET_ALL_EXPANDED", () => {
    it("sets all expanded", () => {
      mutations.CREATE({
        value: {
          id: "1",
          name: "foo"
        }
      });

      mutations.CREATE({
        value: {
          id: "2",
          name: "bar"
        }
      });

      mutations.SET_ALL_EXPANDED({ value: { expanded: true } });

      expect(state.values[0].expanded).toBeTruthy();
      expect(state.values[1].expanded).toBeTruthy();
    });

    it("sets nested expanded", () => {
      mutations.CREATE({
        value: {
          id: "1",
          name: "foo"
        }
      });

      const parent = state.values[0];

      mutations.CREATE({
        value: {
          id: "2",
          name: "bar",
          parent
        }
      });

      mutations.SET_ALL_EXPANDED({ value: { expanded: true } });

      expect(state.values[0].expanded).toBeTruthy();
      expect(state.values[0].children![0].expanded).toBeTruthy();
    });
  });
});
