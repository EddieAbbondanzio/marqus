import Vue from '*.vue';
import { Note } from '@/features/notes/common/note';
import { isBlank } from '@/shared/utils';
import { generateId } from '@/store';
import { UndoPayload, VoidUndoPayload } from '@/store/plugins/undo';
import { MutationTree } from 'vuex';
import { Mutations } from 'vuex-smart-module';
import { NoteState } from './state';

export class NoteMutations extends Mutations<NoteState> {
    SET_STATE(s: NoteState) {
        Object.assign(this.state, s);
    }

    EMPTY_TRASH(p: VoidUndoPayload) {
        this.state.values = this.state.values.filter((n) => !n.trashed);
    }

    CREATE(p: UndoPayload<{ id: string; name: string }>) {
        if (isBlank(p.value.id)) throw Error('Id is required.');
        if (isBlank(p.value.name)) throw Error('Name is required.');

        const note: Note = {
            id: p.value.id,
            name: p.value.name,
            tags: [],
            notebooks: [],
            dateCreated: new Date()
        };

        this.state.values.push(note);
    }

    SET_NAME({ value: { id, name } }: UndoPayload<{ id: string; name: string }>) {
        const note = this.state.values.find((n) => n.id === id)!;
        note.name = name;
    }

    DELETE({ value: { id } }: UndoPayload<{ id: string }>) {
        const i = this.state.values.findIndex((n) => n.id === id);

        if (i === -1) {
            throw Error(`No note with id ${id} found`);
        }

        this.state.values.splice(i, 1);
    }

    /**
     * Add a notebook to one, multiple, or all notes.
     * @param options.noteId Id of the note(s) to add the notebook to.
     * @param options.notebookId Id of the notebook to add.
     */
    ADD_NOTEBOOK({ value: { noteId, notebookId } }: UndoPayload<{ noteId: string | string[]; notebookId: string }>) {
        if (notebookId == null) {
            throw Error('No notebookId passed.');
        }

        const notes = Array.isArray(noteId)
            ? this.state.values.filter((n) => noteId.some((id) => n.id === id))
            : this.state.values.filter((n) => n.id === noteId);

        for (const note of notes) {
            // Check to see if the notebook is already present to prevent duplicates.
            if (!note.notebooks.some((n) => n === notebookId)) {
                note.notebooks.push(notebookId);
                note.hasUnsavedChanges = true;
            }
        }
    }

    /**
     * Add a tag to one, multiple, or all notes.
     * @param options.noteId Id of the note(s) to add the tag to.
     * @param options.tagId Id of the tag to add.
     */
    ADD_TAG({ value: { noteId, tagId } }: UndoPayload<{ noteId: string | string[]; tagId: string }>) {
        if (tagId == null) {
            throw Error('No tagId passed.');
        }

        const notes = Array.isArray(noteId)
            ? this.state.values.filter((n) => noteId.some((id) => n.id === id))
            : this.state.values.filter((n) => n.id === noteId);

        for (const note of notes) {
            // Check to see if the tag is already present first to prevent duplicates.
            if (!note.tags.some((t) => t === tagId)) {
                note.tags.push(tagId);
                note.hasUnsavedChanges = true;
            }
        }
    }

    /**
     * Remove a notebook from one, multiple, or all notes.
     * @param options.noteId Id of one, or more notes to remove notebook from. If none passed, notebook is removed from all notes.
     * @param options.notebookId Id of the notebook to remove.
     */
    REMOVE_NOTEBOOK({
        value: { noteId = undefined, notebookId }
    }: UndoPayload<{ noteId?: string | string[]; notebookId: string }>) {
        if (notebookId == null) {
            throw Error('No notebookId passed.');
        }

        let notes: Note[];

        if (noteId != null) {
            notes = Array.isArray(noteId)
                ? this.state.values.filter((n) => noteId.some((id) => n.id === id))
                : this.state.values.filter((n) => n.id === noteId);
        } else {
            notes = this.state.values;
        }

        for (const note of notes) {
            if (note.notebooks == null) {
                continue;
            }

            const i = note.notebooks.findIndex((n) => n === notebookId);
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
    REMOVE_TAG({ value: { noteId = undefined, tagId } }: UndoPayload<{ noteId?: string | string[]; tagId: string }>) {
        if (tagId == null) {
            throw Error('No tagId passed.');
        }

        // Handle empty case
        if (this.state.values.length === 0) {
            return;
        }

        let notes: Note[];

        if (noteId != null) {
            notes = Array.isArray(noteId)
                ? this.state.values.filter((n) => noteId.some((id) => n.id === id))
                : this.state.values.filter((n) => n.id === noteId);
        } else {
            notes = this.state.values;
        }

        for (const note of notes) {
            if (note.tags == null) {
                continue;
            }

            const i = note.tags.findIndex((t) => t === tagId);
            if (i !== -1) {
                note.tags.splice(i, 1);
                note.hasUnsavedChanges = true;
            }
        }
    }

    MOVE_TO_TRASH({ value: { id } }: UndoPayload<{ id: string }>) {
        const note = this.state.values.find((n) => n.id === id)!;
        note.trashed = true;
        note.hasUnsavedChanges = true;
    }

    RESTORE_FROM_TRASH({ value: { id } }: UndoPayload<{ id: string }>) {
        const note = this.state.values.find((n) => n.id === id)!;
        delete note.trashed;
        note.hasUnsavedChanges = true;
    }

    FAVORITE({ value: { id } }: UndoPayload<{ id: string }>) {
        const note = this.state.values.find((n) => n.id === id)!;
        note.favorited = true;
        note.hasUnsavedChanges = true;
    }

    UNFAVORITE({ value: { id } }: UndoPayload<{ id: string }>) {
        const note = this.state.values.find((n) => n.id === id)!;
        note.favorited = false;
        note.hasUnsavedChanges = true;
    }
}
