import { NoteActions } from "@/store/modules/notes/actions";
import { Note, NoteState } from "@/store/modules/notes/state";
import { inject } from "vuex-smart-module";

describe("Note actions", () => {
  let state: NoteState;
  let actions: NoteActions;
  let commit: jest.Mock<any, any>;

  beforeEach(() => {
    state = new NoteState();
    commit = jest.fn();

    actions = inject(NoteActions, {
      state,
      commit
    });
  });

  describe("toggleFavorite", () => {
    it("favorites if not yet favorited", () => {
      const note = { favorited: false };
      actions.toggleFavorite(note as any);

      expect(commit).toHaveBeenCalledWith("FAVORITE", { value: note });
    });

    it("unfavorites if already favorited", () => {
      const note = { favorited: true };
      actions.toggleFavorite(note as any);

      expect(commit).toHaveBeenCalledWith("UNFAVORITE", { value: note });
    });
  });

  describe("addNotebook", () => {
    it("commits ADD_NOTEBOOK", () => {
      const note = ({ notebooks: [] } as any) as Note;
      actions.addNotebook({ note, notebookId: "1" });

      expect(commit).toHaveBeenCalledWith("ADD_NOTEBOOK", {
        value: { note, notebookId: "1" }
      });
    });
  });

  describe("addTag", () => {
    it("commits ADD_TAG", () => {
      const note = ({ notebooks: [] } as any) as Note;
      actions.addTag({ note, tagId: "1" });

      expect(commit).toHaveBeenCalledWith("ADD_TAG", {
        value: { note, tagId: "1" }
      });
    });
  });

  describe("removeNotebook", () => {
    it("commits REMOVE_NOTEBOOK", () => {
      const note = ({ notebooks: [] } as any) as Note;
      actions.removeNotebook({ note, notebookId: "1" });

      expect(commit).toHaveBeenCalledWith("REMOVE_NOTEBOOK", {
        value: { note, notebookId: "1" }
      });
    });
  });

  describe("removeTag", () => {
    it("commits REMOVE_TAG", () => {
      const note = ({ notebooks: [] } as any) as Note;
      actions.removeTag({ note, tagId: "1" });

      expect(commit).toHaveBeenCalledWith("REMOVE_TAG", {
        value: { note, tagId: "1" }
      });
    });
  });
});
