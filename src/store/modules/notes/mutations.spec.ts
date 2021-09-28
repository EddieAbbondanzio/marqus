import { NoteMutations } from "@/store/modules/notes/mutations";
import { Note, NoteState } from "@/store/modules/notes/state";
import { generateId } from "@/utils/id";
import { inject } from "vuex-smart-module";

describe("Note mutations", () => {
  let state: NoteState;
  let mutations: NoteMutations;

  beforeEach(() => {
    state = new NoteState();
    mutations = inject(NoteMutations, {
      state
    });
  });

  describe("SET_STATE", () => {
    it("sets state", () => {
      const newState: NoteState = {
        values: []
      };

      mutations.SET_STATE(newState);
      expect(state.values).toHaveLength(0);
    });
  });

  describe("EMPTY_TRASH", () => {
    it("removes all notes with trashed = true", () => {
      state.values.push({ id: "1" } as Note);
      state.values.push({ id: "2", trashed: false } as Note);
      state.values.push({ id: "3", trashed: true } as Note);

      mutations.EMPTY_TRASH();
      expect(state.values).toHaveLength(2);
      expect(state.values[0]).toHaveProperty("id", "1");
      expect(state.values[1]).toHaveProperty("id", "2");
    });
  });

  describe("CREATE", () => {
    it("throws if name is blank", () => {
      expect(() => {
        mutations.CREATE({
          name: "  ",
          notebooks: [],
          tags: []
        });
      }).toThrow();
    });

    it("adds note to state", () => {
      mutations.CREATE({
        name: "test",
        notebooks: ["a"],
        tags: ["b"]
      });

      expect(state.values).toHaveLength(1);
      const note = state.values[0];

      expect(note.id).not.toBeNull();
      expect(note.name).toBe("test");
      expect(note.notebooks![0]).toBe("a");
      expect(note.tags![0]).toBe("b");
      expect(note.hasUnsavedChanges).toBeTruthy();
    });
  });

  describe("RENAME", () => {
    it("sets new name and sets hasUnsavedChanges", () => {
      state.values.push({
        id: "1",
        name: "test",
        notebooks: ["a"],
        tags: ["b"],
        created: new Date()
      });

      const note = state.values[0];
      expect(note.hasUnsavedChanges).toBeFalsy();

      mutations.RENAME({ newName: "foo", note });
      expect(note).toHaveProperty("name", "foo");
      expect(note.hasUnsavedChanges).toBeTruthy();
    });
  });

  describe("DELETE", () => {
    it("throws if note is not in state", () => {
      expect(() => {
        mutations.DELETE({ id: "1" } as Note);
      });
    });

    it("removes note", () => {
      state.values.push({
        id: "1",
        name: "test",
        notebooks: ["a"],
        tags: ["b"],
        created: new Date()
      });

      state.values.push({
        id: "2",
        name: "test2",
        notebooks: ["a"],
        tags: ["b"],
        created: new Date()
      });

      mutations.DELETE({ id: "1" } as Note);
      expect(state.values).toHaveLength(1);
      expect(state.values[0]).toHaveProperty("id", "2");
    });
  });

  describe("ADD_NOTEBOOK", () => {
    it("adds notebook to a single note", () => {
      const note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: [],
        created: new Date()
      };

      state.values.push(note);

      mutations.ADD_NOTEBOOK({
        note,
        notebookId: "a"
      });

      expect(note.notebooks).toHaveLength(1);
      expect(note.notebooks[0]).toBe("a");
    });

    it("adds notebook to multiple notes", () => {
      const note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: [],
        created: new Date()
      };

      state.values.push(note);

      const note2 = {
        id: "2",
        name: "test2",
        notebooks: [],
        tags: [],
        created: new Date()
      };

      state.values.push(note2);

      mutations.ADD_NOTEBOOK({
        note: [note, note2],
        notebookId: "a"
      });

      expect(note.notebooks).toHaveLength(1);
      expect(note2.notebooks).toHaveLength(1);
      expect(note.notebooks[0]).toBe("a");
      expect(note2.notebooks[0]).toBe("a");
    });
  });

  describe("ADD_TAG", () => {
    it("adds tag to a single note", () => {
      const note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: [],
        created: new Date()
      };

      state.values.push(note);

      mutations.ADD_TAG({
        note,
        tagId: "a"
      });

      expect(note.tags).toHaveLength(1);
      expect(note.tags[0]).toBe("a");
    });

    it("adds tag to multiple notes", () => {
      const note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: [],
        created: new Date()
      };

      state.values.push(note);

      const note2 = {
        id: "2",
        name: "test2",
        notebooks: [],
        tags: [],
        created: new Date()
      };

      state.values.push(note2);

      mutations.ADD_TAG({
        note: [note, note2],
        tagId: "a"
      });

      expect(note.tags).toHaveLength(1);
      expect(note2.tags).toHaveLength(1);
      expect(note.tags[0]).toBe("a");
      expect(note2.tags[0]).toBe("a");
    });
  });

  describe("REMOVE_NOTEBOOK", () => {
    it("removes notebook from a single note", () => {
      const note: Note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: [],
        created: new Date()
      };

      note.notebooks!.push("a");

      mutations.REMOVE_NOTEBOOK({
        note,
        notebookId: "a"
      });

      expect(note.notebooks).toHaveLength(0);
    });

    it("removes notebook from multiple notes", () => {
      const note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: [],
        created: new Date()
      };

      state.values.push(note);

      const note2 = {
        id: "2",
        name: "test2",
        notebooks: ["a"],
        tags: [],
        created: new Date()
      };

      state.values.push(note2);

      mutations.REMOVE_NOTEBOOK({
        note: [note, note2],
        notebookId: "a"
      });

      expect(note.notebooks).toHaveLength(0);
      expect(note2.notebooks).toHaveLength(0);
    });

    it("removes notebook from all notes", () => {
      const note = {
        id: "1",
        name: "test",
        notebooks: ["a"],
        tags: [],
        created: new Date()
      };

      state.values.push(note);

      const note2 = {
        id: "2",
        name: "test2",
        notebooks: ["a"],
        tags: [],
        created: new Date()
      };

      state.values.push(note2);

      mutations.REMOVE_NOTEBOOK({
        notebookId: "a"
      });

      expect(note.notebooks).toHaveLength(0);
      expect(note2.notebooks).toHaveLength(0);
    });
  });

  describe("REMOVE_TAG", () => {
    it("removes tag from a single note", () => {
      const note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: ["a"],
        created: new Date()
      };

      state.values.push(note);

      const note2 = {
        id: "2",
        name: "test2",
        notebooks: [],
        tags: ["a", "b"],
        created: new Date()
      };

      state.values.push(note2);

      mutations.REMOVE_TAG({
        note,
        tagId: "a"
      });

      expect(note.tags).toHaveLength(0);
      expect(note2.tags[0]).toBe("a");
    });
    it("removes tag from multiple notes", () => {
      const note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: ["a"],
        created: new Date()
      };

      state.values.push(note);

      const note2 = {
        id: "2",
        name: "test2",
        notebooks: [],
        tags: ["a", "b"],
        created: new Date()
      };

      state.values.push(note2);

      mutations.REMOVE_TAG({
        note: [note, note2],
        tagId: "a"
      });

      expect(note.tags).toHaveLength(0);
      expect(note2.tags).toHaveLength(1);
    });

    it("removes tag from all notes", () => {
      const note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: ["a"],
        created: new Date()
      };

      state.values.push(note);

      const note2 = {
        id: "2",
        name: "test2",
        notebooks: [],
        tags: ["a", "b"],
        created: new Date()
      };

      state.values.push(note2);

      mutations.REMOVE_TAG({
        tagId: "a"
      });

      expect(note.tags).toHaveLength(0);
      expect(note2.tags).toHaveLength(1);
    });
  });

  describe("MOVE_TO_TRASH", () => {
    it("marks note as trashed, and sets hasUnsavedChanges", () => {
      const note: Note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: ["a"],
        created: new Date()
      };

      state.values.push(note);

      mutations.MOVE_TO_TRASH(note);

      expect(note.trashed).toBeTruthy();
      expect(note.hasUnsavedChanges).toBeTruthy();
    });
  });

  describe("RESTORE_FROM_TRASH", () => {
    it("marks note as untrashed, and sets hasUnsavedChanges", () => {
      const note: Note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: ["a"],
        created: new Date(),
        trashed: true
      };

      state.values.push(note);

      mutations.RESTORE_FROM_TRASH(note);

      expect(note.trashed).toBeFalsy();
      expect(note.hasUnsavedChanges).toBeTruthy();
    });
  });

  describe("FAVORITE", () => {
    it("sets favorited true and sets hasUnsavedChanges", () => {
      const note: Note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: ["a"],
        created: new Date()
      };

      state.values.push(note);

      expect(note.favorited).toBeFalsy();
      mutations.FAVORITE(note);
      expect(note.favorited).toBeTruthy();
      expect(note.hasUnsavedChanges).toBeTruthy();
    });
  });

  describe("UNFAVORITE", () => {
    it("sets favorited false and sets hasUnsavedChanges", () => {
      const note: Note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: ["a"],
        created: new Date(),
        favorited: true
      };

      state.values.push(note);

      expect(note.favorited).toBeTruthy();
      mutations.UNFAVORITE(note);
      expect(note.favorited).toBeFalsy();
      expect(note.hasUnsavedChanges).toBeTruthy();
    });
  });

  describe("MARK_ALL_NOTES_SAVED", () => {
    it("marks all notes as saved", () => {
      const note: Note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: ["a"],
        created: new Date(),
        hasUnsavedChanges: true
      };

      state.values.push(note);

      const note2: Note = {
        id: "1",
        name: "test",
        notebooks: [],
        tags: ["a"],
        created: new Date(),
        hasUnsavedChanges: true
      };

      state.values.push(note2);

      mutations.MARK_ALL_NOTES_SAVED();

      expect(note.hasUnsavedChanges).toBeFalsy();
      expect(note2.hasUnsavedChanges).toBeFalsy();
    });
  });
});
