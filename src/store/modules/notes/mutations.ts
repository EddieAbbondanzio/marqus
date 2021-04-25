import { generateId } from '@/utils/id';
import { MutationTree } from 'vuex';
import { Note, NoteState } from './state';

export const mutations: MutationTree<NoteState> = {
    CREATE(state, note: Note) {
        if (note.name == null) {
            throw Error('Name is required.');
        }

        if (note.id == null) {
            note.id = generateId();
        }

        state.values.push(note);
    },
    /**
     * Partial update note via id
     */
    UPDATE(state, { id, name, content }: { id: string; name?: string; content?: string }) {
        const n = state.values.find((n) => n.id === id);

        if (n == null) {
            throw Error(`No note with ${id} found.`);
        }

        if (name != null) {
            n.name = name;
        }

        if (content != null) {
            n.content = content;
        }
    },
    DELETE(state, id: string) {
        const i = state.values.findIndex((n) => n.id === id);

        if (i === -1) {
            throw Error(`No note with id ${id} found`);
        }

        state.values.splice(i, 1);
    }
};
