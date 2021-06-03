import Vue from '*.vue';
import { generateId } from '@/core/store/entity';
import { Note } from '@/modules/notes/common/note';
import { MutationTree } from 'vuex';
import { NoteState } from './state';

export const mutations: MutationTree<NoteState> = {
    INIT(state, s: NoteState) {
        Object.assign(state, s);
    },
    EMPTY_TRASH(state) {
        state.values = state.values.filter((n) => !n.trashed);
    },
    CREATE(state, note: Note) {
        if (note.name == null) {
            throw Error('Name is required.');
        }

        if (note.id == null) {
            note.id = generateId();
        }

        if (note.tags == null) note.tags = [];
        if (note.notebooks == null) note.notebooks = [];

        state.values.push(note);
    },
    /**
     * Update the name of a note
     */
    NAME(state, { id, name }: { id: string | Note; name: string }) {
        const note = state.values.find((n) => n.id === id)!;
        note.name = name;
    },
    DELETE(state, id: string) {
        const i = state.values.findIndex((n) => n.id === id);

        if (i === -1) {
            throw Error(`No note with id ${id} found`);
        }

        state.values.splice(i, 1);
    },
    /**
     * Add a notebook to one, multiple, or all notes.
     * @param options.noteId Id of the note(s) to add the notebook to.
     * @param options.notebookId Id of the notebook to add.
     */
    ADD_NOTEBOOK(state, { noteId, notebookId }: { noteId: string | string[]; notebookId: string }) {
        if (notebookId == null) {
            throw Error('No notebookId passed.');
        }

        const notes = Array.isArray(noteId)
            ? state.values.filter((n) => noteId.some((id) => n.id === id))
            : state.values.filter((n) => n.id === noteId);

        for (const note of notes) {
            // Check to see if the notebook is already present to prevent duplicates.
            if (!note.notebooks.some((n) => n === notebookId)) {
                note.notebooks.push(notebookId);
            }
        }
    },
    /**
     * Add a tag to one, multiple, or all notes.
     * @param options.noteId Id of the note(s) to add the tag to.
     * @param options.tagId Id of the tag to add.
     */
    ADD_TAG(state, { noteId, tagId }: { noteId: string | string[]; tagId: string }) {
        if (tagId == null) {
            throw Error('No tagId passed.');
        }

        const notes = Array.isArray(noteId)
            ? state.values.filter((n) => noteId.some((id) => n.id === id))
            : state.values.filter((n) => n.id === noteId);

        for (const note of notes) {
            // Check to see if the tag is already present first to prevent duplicates.
            if (!note.tags.some((t) => t === tagId)) {
                note.tags.push(tagId);
            }
        }
    },
    /**
     * Remove a notebook from one, multiple, or all notes.
     * @param options.noteId Id of one, or more notes to remove notebook from. If none passed, notebook is removed from all notes.
     * @param options.notebookId Id of the notebook to remove.
     */
    REMOVE_NOTEBOOK(state, { noteId = undefined, notebookId }: { noteId?: string | string[]; notebookId: string }) {
        if (notebookId == null) {
            throw Error('No notebookId passed.');
        }

        let notes: Note[];

        if (noteId != null) {
            notes = Array.isArray(noteId)
                ? state.values.filter((n) => noteId.some((id) => n.id === id))
                : state.values.filter((n) => n.id === noteId);
        } else {
            notes = state.values;
        }

        for (const note of notes) {
            if (note.notebooks == null) {
                continue;
            }

            const i = note.notebooks.findIndex((n) => n === notebookId);
            if (i !== -1) {
                note.notebooks.splice(i, 1);
            }
        }
    },
    /**
     * Remove a tag from one, multiple, or all notes.
     * @param options.noteId Id of one, or more notes to remove the tag from. If none passed, tag is removed from all notes.
     * @param options.tagId Id of the tag to be removed.
     */
    REMOVE_TAG(state, { noteId = undefined, tagId }: { noteId?: string | string[]; tagId: string }) {
        if (tagId == null) {
            throw Error('No tagId passed.');
        }

        let notes: Note[];

        if (noteId != null) {
            notes = Array.isArray(noteId)
                ? state.values.filter((n) => noteId.some((id) => n.id === id))
                : state.values.filter((n) => n.id === noteId);
        } else {
            notes = state.values;
        }

        for (const note of notes) {
            if (note.tags == null) {
                continue;
            }

            const i = note.tags.findIndex((t) => t === tagId);
            if (i !== -1) {
                note.tags.splice(i, 1);
            }
        }
    },
    MOVE_TO_TRASH(state, id: string) {
        const note = state.values.find((n) => n.id === id)!;
        note.trashed = true;
    },
    RESTORE_FROM_TRASH(state, id: string) {
        const note = state.values.find((n) => n.id === id)!;
        delete note.trashed;
    },
    FAVORITE(state, id: string | Note) {
        const note = state.values.find((n) => n.id === id)!;
        note.favorited = true;
    },
    UNFAVORITE(state, id: string | Note) {
        const note = state.values.find((n) => n.id === id)!;
        note.favorited = false;
    }
};
