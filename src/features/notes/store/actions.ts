import { Note } from '@/features/notes/shared/note';
import { NoteGetters } from '@/features/notes/store/getters';
import { NoteMutations } from '@/features/notes/store/mutations';
import { NoteState } from '@/features/notes/store/state';
import { ActionTree } from 'vuex';
import { Actions } from 'vuex-smart-module';

export class NoteActions extends Actions<NoteState, NoteGetters, NoteMutations, NoteActions> {
    toggleFavorite(note: Note) {
        if (note.favorited) {
            this.commit('UNFAVORITE', { value: note });
        } else {
            this.commit('FAVORITE', { value: note });
        }
    }

    addNotebook({ note, notebookId }: { note: Note | Note[]; notebookId: string }) {
        this.commit('ADD_NOTEBOOK', {
            value: { note: note, notebookId }
        });
    }

    addTag({ note, tagId }: { note: Note | Note[]; tagId: string }) {
        this.commit('ADD_TAG', {
            value: { note, tagId }
        });
    }

    removeNotebook({ note, notebookId }: { note: Note | Note[]; notebookId: string }) {
        this.commit('REMOVE_NOTEBOOK', {
            value: { note, notebookId }
        });
    }

    removeTag({ note, tagId }: { note: Note | Note[]; tagId: string }) {
        this.commit('REMOVE_TAG', {
            value: { note, tagId }
        });
    }
}
