import { Note } from '@/store/modules/notes/state';
import { id } from '@/utils/id';
import { MutationTree } from 'vuex';
import { LocalNavigation } from './state';

export const mutations: MutationTree<LocalNavigation> = {
    WIDTH(s, width) {
        s.width = width;
    },
    NOTE_INPUT_VALUE(s, value: string) {
        s.notes.input.name = value;
    },
    NOTE_INPUT_CLEAR(s) {
        s.notes.input = {};
    },
    NOTE_INPUT_START(s, note: Note | null = null) {
        // Create
        if (note == null) {
            s.notes.input = {
                id: id(),
                dateCreated: new Date(),
                dateModified: new Date(),
                name: '',
                content: '',
                mode: 'create'
            };
        }
        // Update
        else {
        }
    }
};
