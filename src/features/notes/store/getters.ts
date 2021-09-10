import { Note } from '@/features/notes/shared/note';
import { NoteState } from '@/features/notes/store/state';
import { Getters } from 'vuex-smart-module';

export class NoteGetters extends Getters<NoteState> {
    byId(id: string): Note | undefined;
    byId(id: string, opts: { required: true }): Note;
    byId(id: string, opts: { required?: boolean } = {}) {
        const note = this.state.values.find((n) => n.id === id);

        if (opts.required && note == null) {
            throw Error(`No note with id ${id} found.`);
        }

        return note;
    }

    notesByTag(tagId: string) {
        if (tagId == null) {
            return [];
        }

        return this.state.values.filter((n) => n.tags.some((t) => t === tagId));
    }

    notesByNotebook(notebookId: string) {
        if (notebookId == null) {
            return [];
        }

        return this.state.values.filter((n) => n.notebooks.some((nb) => nb === notebookId));
    }
}
