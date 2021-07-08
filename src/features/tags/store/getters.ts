import { Note } from '@/features/notes/common/note';
import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { Getters } from 'vuex-smart-module';
import { TagState } from './state';

export class TagGetters extends Getters<TagState> {
    get tagsForNote() {
        return () => (note: Note) => {
            if (note == null) {
                return [];
            }

            return this.state.values.filter((t) => note.tags.some((tagId) => t.id === tagId));
        };
    }
}
