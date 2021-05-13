import { generateId } from '@/utils/id';
import { MutationTree } from 'vuex';
import { Note, NoteState } from './state';

export const mutations: MutationTree<NoteState> = {
    INIT(state, s: NoteState) {
        Object.assign(state, s);
    },
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
    UPDATE(state, note: Note) {
        const n = state.values.find((n) => n.id === note.id);

        if (n == null) {
            throw Error(`No note with ${note.id} found.`);
        }

        n.name = note.name;
    },
    DELETE(state, id: string) {
        const i = state.values.findIndex((n) => n.id === id);

        if (i === -1) {
            throw Error(`No note with id ${id} found`);
        }

        state.values.splice(i, 1);
    }
};
