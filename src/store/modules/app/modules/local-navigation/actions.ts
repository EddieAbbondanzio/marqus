import { Note } from '@/store/modules/notes/state';
import { State } from '@/store/state';
import { ActionTree } from 'vuex';
import { LocalNavigation } from './state';

export const actions: ActionTree<LocalNavigation, State> = {
    noteInputStart({ commit, rootState }, id: string | null = null) {
        let note: Note | undefined;

        if (id != null) {
            note = rootState.notes.values.find((n) => n.id === id);

            if (note == null) {
                throw Error(`No note with id ${id} found.`);
            }
        }

        commit('NOTE_INPUT_START', note);
    }
};
