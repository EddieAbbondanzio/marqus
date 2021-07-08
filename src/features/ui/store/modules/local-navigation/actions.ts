import { Note } from '@/features/notes/common/note';
import { confirmDeleteOrTrash } from '@/shared/utils';
import { generateId } from '@/store';
import { State } from '@/store/state';
import { ActionTree } from 'vuex';
import { LocalNavigation } from './state';

export const actions: ActionTree<LocalNavigation, State> = {
    setActive({ commit, state }, id: string) {
        commit('ACTIVE_UPDATED', id);
    },
    noteInputStart({ commit, rootState }, { id }: { id?: string } = {}) {
        let note: Note | undefined;

        if (id != null) {
            note = rootState.notes.values.find((n) => n.id === id);

            if (note == null) {
                throw Error(`No note with id ${id} found.`);
            }
        }

        let active: any;

        if (
            rootState.ui.globalNavigation.active?.section === 'tag' ||
            rootState.ui.globalNavigation.active?.section === 'notebook'
        ) {
            active = {
                id: rootState.ui.globalNavigation.active.id,
                type: rootState.ui.globalNavigation.active.section
            };
        }

        commit('NOTE_INPUT_STARTED', {
            active,
            note: { id: note?.id, name: note?.name }
        });
    },
    noteInputUpdate({ commit, state }, value: string) {
        commit('NOTE_INPUT_NAME_UPDATED', value);
    },
    noteInputConfirm({ commit, state, rootState }) {
        const input = state.notes.input!;
        let note: Note;
        let old: Note | undefined;

        switch (input.mode) {
            case 'create':
                note = {
                    id: generateId(),
                    dateCreated: new Date(),
                    dateModified: new Date(),
                    name: input.name,
                    notebooks: input.notebooks ?? [],
                    tags: input.tags ?? []
                };

                commit('notes/CREATE', note, { root: true });
                break;

            case 'update':
                old = rootState.notes.values.find((n) => n.id === input.id!)!;

                note = {
                    id: old.id,
                    dateCreated: old.dateCreated,
                    dateModified: new Date(),
                    name: input.name,
                    notebooks: old.notebooks,
                    tags: old.tags
                };

                commit('notes/NAME', note, { root: true });
                break;
        }

        commit('NOTE_INPUT_CLEARED');
    },
    noteInputCancel({ commit, state }) {
        commit('NOTE_INPUT_CLEARED');
    },
    async noteDelete({ commit, rootState }, id: string) {
        if (id == null) {
            throw Error();
        }

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
    },

    widthUpdated({ commit, state }, width: string) {
        commit('WIDTH_UPDATED', width);
    }
};
