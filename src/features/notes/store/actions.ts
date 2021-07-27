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
            throw Error('Note not found');
        }

        if (toUpdate.favorited) {
            this.commit('UNFAVORITE', { value: toUpdate });
        } else {
            this.commit('FAVORITE', { value: toUpdate });
        }
    }

    addNotebook({ noteId, notebookId }: { noteId: string | string[]; notebookId: string }) {
        this.commit('ADD_NOTEBOOK', {
            value: { noteId, notebookId }
        });
    }

    addTag({ noteId, tagId }: { noteId: string | string[]; tagId: string }) {
        this.commit('ADD_TAG', {
            value: { noteId, tagId }
        });
    }

    removeNotebook({ noteId, notebookId }: { noteId: string | string[]; notebookId: string }) {
        this.commit('REMOVE_NOTEBOOK', {
            value: { noteId, notebookId }
        });
    }

    removeTag({ noteId, tagId }: { noteId: string | string[]; tagId: string }) {
        this.commit('REMOVE_TAG', {
            value: { noteId, tagId }
        });
    }
}
