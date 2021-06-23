import { Note } from '@/features/notes/common/note';
import { NoteState } from '@/features/notes/store/state';
import { State } from '@/store/state';
import { ActionTree } from 'vuex';

export const actions: ActionTree<NoteState, State> = {
    toggleFavorite({ commit, state }, note: string | Note) {
        const toUpdate = typeof note === 'string' ? state.values.find((n) => n.id === note)! : note;

        if (toUpdate == null) {
            throw Error(`Note not found.`);
        }

        commit(toUpdate.favorited ? 'UNFAVORITE' : 'FAVORITE', toUpdate);
    }
};
