import { Note } from '@/features/notes/common/note';
import { Getters } from 'vuex-smart-module';
import { TagState } from './state';

export class TagGetters extends Getters<TagState> {
    tagsForNote(note: Note) {
        if (note == null) {
            return [];
        }

        return this.state.values.filter((t) => note.tags.some((tagId) => t.id === tagId));
    }

    byId(id: string) {
        return this.state.values.find((t) => t.id === id);
    }
}
