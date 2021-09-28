import { NotebookGetters } from "@/store/modules/notebooks/getters";
import { NotebookState } from "@/store/modules/notebooks/state";
import { inject } from "vuex-smart-module";
import { Note } from "../notes/state";

describe("Notebook getters", () => {
  let state: NotebookState;
  let getters: NotebookGetters;

  beforeEach(() => {
    state = {
      values: []
    };

    getters = inject(NotebookGetters, {
      state
    });
  });

  describe("count", () => {
    it("returns total count of notebooks", () => {
      getters = inject(NotebookGetters, {
        state,
        getters: {
          flatten: [{ id: "1", name: "foo" }]
        }
      });

      expect(getters.count).toBe(1);
    });
  });

  describe("flatten", () => {
    it("includes nested", () => {
      state.values.push({ id: "1", name: "foo" });
      state.values.push({ id: "2", name: "bar" });
      state.values.push({ id: "3", name: "baz" });

      const parent = state.values[2];
      parent.children = [{ id: "4", name: "cat", parent }];

      expect(getters.flatten).toHaveLength(4);
    });
  });

  describe("flattenVisible", () => {
    it("includes nested only if expanded", () => {
      state.values.push({ id: "1", name: "foo" });
      state.values.push({ id: "2", name: "bar" });
      state.values.push({ id: "3", name: "baz" });

      const parent = state.values[2];
      parent.expanded = false;
      parent.children = [{ id: "4", name: "cat", parent }];

      expect(getters.flattenVisible).toHaveLength(3);
    });
  });

  describe("first", () => {
    it("returns the first notebook", () => {
      state.values.push({ id: "1", name: "foo" });
      state.values.push({ id: "2", name: "bar" });

      const first = getters.first();
      expect(first).toHaveProperty("id", "1");
    });
  });

  describe("getNext", () => {
    it("returns the next notebook in the array", () => {
      getters = inject(NotebookGetters, {
        state,
        getters: {
          flattenVisible: [
            { id: "1", name: "foo" },
            { id: "2", name: "bar" },
            { id: "3", name: "baz" }
          ]
        }
      });

      expect(getters.getNext("2")).toHaveProperty("id", "3");
    });

    it("returns null if none after current", () => {
      getters = inject(NotebookGetters, {
        state,
        getters: {
          flattenVisible: [
            { id: "1", name: "foo" },
            { id: "2", name: "bar" },
            { id: "3", name: "baz" }
          ]
        }
      });

      expect(getters.getNext("3")).toBeNull();
    });
  });

  describe("getPrevious", () => {
    it("returns the previous notebook in the array", () => {
      getters = inject(NotebookGetters, {
        state,
        getters: {
          flattenVisible: [
            { id: "1", name: "foo" },
            { id: "2", name: "bar" },
            { id: "3", name: "baz" }
          ]
        }
      });

      expect(getters.getPrevious("2")).toHaveProperty("id", "1");
    });

    it("returns null if none before current", () => {
      getters = inject(NotebookGetters, {
        state,
        getters: {
          flattenVisible: [
            { id: "1", name: "foo" },
            { id: "2", name: "bar" },
            { id: "3", name: "baz" }
          ]
        }
      });

      expect(getters.getPrevious("1")).toBeNull();
    });
  });

  describe("notebooksForNote", () => {
    it("returns all the notebooks of a note", () => {
      state.values.push({ id: "1", name: "foo" });
      state.values.push({ id: "2", name: "bar" });
      state.values.push({ id: "3", name: "baz" });

      const note: Note = {
        id: "1",
        name: "test-note",
        dateCreated: new Date(),
        notebooks: ["1", "2"],
        tags: []
      };

      getters = inject(NotebookGetters, {
        state,
        getters: {
          flatten: [
            { id: "1", name: "foo" },
            { id: "2", name: "bar" },
            { id: "3", name: "baz" }
          ]
        }
      });

      const notebooks = getters.notebooksForNote(note);
      expect(notebooks).toHaveLength(2);
      expect(notebooks[0]).toHaveProperty("id", "1");
      expect(notebooks[1]).toHaveProperty("id", "2");
    });
  });

  describe("byId", () => {
    it("can find a root match", () => {
      state.values.push({ id: "1", name: "foo" });
      state.values.push({ id: "2", name: "bar" });
      state.values.push({ id: "3", name: "baz" });

      const parent = state.values[2];
      parent.expanded = false;
      parent.children = [{ id: "4", name: "cat", parent }];

      const match = getters.byId("1");
      expect(match).toHaveProperty("id", "1");
    });

    it("can find a nested notebook", () => {
      state.values.push({ id: "1", name: "foo" });
      state.values.push({ id: "2", name: "bar" });
      state.values.push({ id: "3", name: "baz" });

      const parent = state.values[2];
      parent.expanded = false;
      parent.children = [{ id: "4", name: "cat", parent }];

      const match = getters.byId("4");
      expect(match).toHaveProperty("id", "4");
    });

    it("returns nothing if no match found after searching", () => {
      state.values.push({ id: "1", name: "foo" });
      state.values.push({ id: "2", name: "bar" });
      state.values.push({ id: "3", name: "baz" });

      const parent = state.values[2];
      parent.expanded = false;
      parent.children = [{ id: "4", name: "cat", parent }];

      const match = getters.byId("42");
      expect(match).toBeUndefined();
    });
  });
});
