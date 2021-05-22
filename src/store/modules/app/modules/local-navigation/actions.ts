import { loadNoteContentFromFileSystem } from '@/store/modules/notes';
import { Note } from '@/store/modules/notes/state';
import { State } from '@/store/state';
import { confirmDelete } from '@/utils/prompts/confirm-delete';
import { confirmDeleteOrTrash } from '@/utils/prompts/confirm-delete-or-trash';
import { ActionTree } from 'vuex';
import { LocalNavigation } from './state';

export const actions: ActionTree<LocalNavigation, State> = {
    noteInputStart({ commit, rootState }, { id }: { id?: string } = {}) {
        let note: Note | undefined;

        if (id != null) {
            note = rootState.notes.values.find((n) => n.id === id);

            if (note == null) {
                throw Error(`No note with id ${id} found.`);
            }
        }

        const active = rootState.app.globalNavigation.active;
        commit('NOTE_INPUT_START', { note, active });
    },
    noteInputConfirm({ commit, state }) {
        const input = state.notes.input;

        const note: Note = {
            id: input.id!,
            name: input.name!,
            dateCreated: input.dateCreated!,
            dateModified: input.dateModified!,
            notebooks: input.notebooks!,
            tags: input.tags!
        };

        switch (input.mode) {
            case 'create':
                commit('notes/CREATE', note, { root: true });
                break;

            case 'update':
                note.dateModified = new Date();
                commit('notes/UPDATE', note, { root: true });
                break;
        }

        commit('NOTE_INPUT_CLEAR');
    },
    noteInputCancel({ commit }) {
        commit('NOTE_INPUT_CLEAR');
    },
    async noteDelete({ commit, rootState }, id: string) {
        const note = rootState.notes.values.find((n) => n.id === id);

        if (note == null) {
            throw Error(`No note with id ${id} found.`);
        }

        const confirm = await confirmDeleteOrTrash('note', note.name);

        switch (confirm) {
            case 'delete':
                commit('notes/DELETE', id, { root: true });
                break;

            case 'trash':
                commit('notes/MOVE_TO_TRASH', id, { root: true });
                break;
        }
    }
};
