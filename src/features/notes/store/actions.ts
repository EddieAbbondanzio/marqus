import { Note } from '@/features/notes/common/note';
import { NoteGetters } from '@/features/notes/store/getters';
import { NoteMutations } from '@/features/notes/store/mutations';
import { NoteState } from '@/features/notes/store/state';
import { ActionTree } from 'vuex';
import { Actions } from 'vuex-smart-module';

export class NoteActions extends Actions<NoteState, NoteGetters, NoteMutations, NoteActions> {
    toggleFavorite(note: string | Note) {
        const toUpdate = typeof note === 'string' ? this.state.values.find((n) => n.id === note)! : note;

        if (toUpdate == null) {
            throw Error(`Note not found.`);
        }

        this.commit(toUpdate.favorited ? 'UNFAVORITE' : 'FAVORITE', toUpdate);
    }
}
