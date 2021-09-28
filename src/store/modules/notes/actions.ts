import { NoteGetters } from "@/store/modules/notes/getters";
import { NoteMutations } from "@/store/modules/notes/mutations";
import { Note, NoteState } from "@/store/modules/notes/state";
import { ActionTree } from "vuex";
import { Actions } from "vuex-smart-module";

export class NoteActions extends Actions<
  NoteState,
  NoteGetters,
  NoteMutations,
  NoteActions
> {
  toggleFavorite(note: Note) {
    if (note.favorited) {
      this.commit("UNFAVORITE", note);
    } else {
      this.commit("FAVORITE", note);
    }
  }

  addNotebook({
    note,
    notebookId
  }: {
    note: Note | Note[];
    notebookId: string;
  }) {
    this.commit("ADD_NOTEBOOK", {
      note: note,
      notebookId
    });
  }

  addTag({ note, tagId }: { note: Note | Note[]; tagId: string }) {
    this.commit("ADD_TAG", {
      note,
      tagId
    });
  }

  removeNotebook({
    note,
    notebookId
  }: {
    note: Note | Note[];
    notebookId: string;
  }) {
    this.commit("REMOVE_NOTEBOOK", {
      note,
      notebookId
    });
  }

  removeTag({ note, tagId }: { note: Note | Note[]; tagId: string }) {
    this.commit("REMOVE_TAG", { note, tagId });
  }
}
