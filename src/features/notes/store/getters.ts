import { NoteState } from '@/features/notes/store/state';
import { Getters } from 'vuex-smart-module';

export class NoteGetters extends Getters<NoteState> {
    byId(id: string) {
        return this.state.values.find((n) => n.id === id);
    }

    notesByTag(tagId: string) {
        if (tagId == null) {
            return [];
        }

        return this.state.values.filter((n) => n.tags.some((t) => t === tagId));
    }

    notesByNotebook(notebookId: string) {
        if (notebookId == null) {
            return [];
        }

        return this.state.values.filter((n) => n.notebooks.some((nb) => nb === notebookId));
    }
}
