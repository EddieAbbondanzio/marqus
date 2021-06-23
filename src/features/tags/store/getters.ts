import { Note } from '@/features/notes/common/note';
import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { TagState } from './state';

export const getters: GetterTree<TagState, State> = {
    tagsForNote: (s) => (note: Note) => {
        if (note == null) {
            return [];
        }

        return s.values.filter((t) => note.tags.some((tagId) => t.id === tagId));
    }
};
