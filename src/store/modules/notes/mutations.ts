import Vue from "*.vue";
import { MutationTree } from "vuex";
import { Mutations } from "vuex-smart-module";
import { Note, noteSchema, NoteState } from "./state";

export class NoteMutations extends Mutations<NoteState> {
  SET_STATE(s: NoteState) {
    Object.assign(this.state, s);
  }

  EMPTY_TRASH() {
    this.state.values = this.state.values.filter(n => !n.trashed);
  }

  CREATE(create: Partial<Note>) {
    const note: Note = noteSchema.validateSync(create) as any;
    note.hasUnsavedChanges = true;

    this.state.values.push(note);
  }

  RENAME({ note, newName }: { note: Note; newName: string }) {
    note.name = newName;
    note.hasUnsavedChanges = true;
  }

  DELETE(note: Note) {
    const i = this.state.values.findIndex(n => n.id === note.id);

    if (i === -1) {
      throw Error(`No note with id ${note.id} found`);
    }

    this.state.values.splice(i, 1);
  }

  /**
   * Add a notebook to one, multiple, or all notes.
   * @param options.noteId Id of the note(s) to add the notebook to.
   * @param options.notebookId Id of the notebook to add.
   */
  ADD_NOTEBOOK({
    note,
    notebookId
  }: {
    note: Note | Note[];
    notebookId: string;
  }) {
    // if (notebookId == null) {
    //     throw Error('No notebookId passed.');
    // }
    // const notes = Array.isArray(note) ? note : [note];
    // for (const note of notes) {
    //     // Check to see if the notebook is already present to prevent duplicates.
    //     if (!note.notebooks.some((n) => n === notebookId)) {
    //         note.notebooks.push(notebookId);
    //         note.hasUnsavedChanges = true;
    //     }
    // }
  }

  /**
   * Add a tag to one, multiple, or all notes.
   * @param options.noteId Id of the note(s) to add the tag to.
   * @param options.tagId Id of the tag to add.
   */
  ADD_TAG({ note, tagId }: { note: Note | Note[]; tagId: string }) {
    // if (tagId == null) {
    //     throw Error('No tagId passed.');
    // }
    // const notes = Array.isArray(note) ? note : [note];
    // for (const note of notes) {
    //     // Check to see if the tag is already present first to prevent duplicates.
    //     if (!note.tags.some((t) => t === tagId)) {
    //         note.tags.push(tagId);
    //         note.hasUnsavedChanges = true;
    //     }
    // }
  }

  /**
   * Remove a notebook from one, multiple, or all notes.
   * @param options.noteId Id of one, or more notes to remove notebook from. If none passed, notebook is removed from all notes.
   * @param options.notebookId Id of the notebook to remove.
   */
  REMOVE_NOTEBOOK({
    note = undefined,
    notebookId
  }: {
    note?: Note | Note[];
    notebookId: string;
  }) {
    if (notebookId == null) {
      throw Error("No notebookId passed.");
    }

    let notes: Note[];

    if (note != null) {
      notes = Array.isArray(note) ? note : [note];
    } else {
      notes = this.state.values;
    }

    for (const note of notes) {
      if (note.notebooks == null) {
        continue;
      }

      const i = note.notebooks.findIndex(n => n === notebookId);
      if (i !== -1) {
        note.notebooks.splice(i, 1);
        note.hasUnsavedChanges = true;
      }
    }
  }

  /**
   * Remove a tag from one, multiple, or all notes.
   * @param options.noteId Id of one, or more notes to remove the tag from. If none passed, tag is removed from all notes.
   * @param options.tagId Id of the tag to be removed.
   */
  REMOVE_TAG({
    note = undefined,
    tagId
  }: {
    note?: Note | Note[];
    tagId: string;
  }) {
    if (tagId == null) {
      throw Error("No tagId passed.");
    }

    // Handle empty case
    if (this.state.values.length === 0) {
      return;
    }

    let notes: Note[];

    // Get all the notes to remove it from
    if (note != null) {
      notes = Array.isArray(note) ? note : [note];
    } else {
      notes = this.state.values;
    }

    // Remove the tag from each note we found
    for (const note of notes) {
      if (note.tags == null) {
        continue;
      }

      const i = note.tags.findIndex(t => t === tagId);
      if (i !== -1) {
        note.tags.splice(i, 1);
        note.hasUnsavedChanges = true;
      }
    }
  }

  MOVE_TO_TRASH(note: Note) {
    note.trashed = true;
    note.hasUnsavedChanges = true;
  }

  RESTORE_FROM_TRASH(note: Note) {
    delete note.trashed;
    note.hasUnsavedChanges = true;
  }

  FAVORITE(note: Note) {
    note.favorited = true;
    note.hasUnsavedChanges = true;
  }

  UNFAVORITE(note: Note) {
    note.favorited = false;
    note.hasUnsavedChanges = true;
  }

  MARK_ALL_NOTES_SAVED() {
    for (let i = 0; i < this.state.values.length; i++) {
      delete this.state.values[i].hasUnsavedChanges;
    }
  }
}
