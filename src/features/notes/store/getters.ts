import { NoteState } from '@/features/notes/store/state';
import { Getters } from 'vuex-smart-module';

export class NoteGetters extends Getters<NoteState> {
    get notesByTag() {
        return (tagId: string) => {
            if (tagId == null) {
                return [];
            }

            return this.state.values.filter((n) => n.tags.some((t) => t === tagId));
        };
    }
}
