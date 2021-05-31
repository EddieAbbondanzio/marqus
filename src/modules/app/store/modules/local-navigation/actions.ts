import { Note } from '@/modules/notes/common/note';
import { State } from '@/store/state';
import { confirmDeleteOrTrash } from '@/utils/prompts/confirm-delete-or-trash';
import { ActionTree } from 'vuex';
import { LocalNavigation, LocalNavigationEvent } from './state';

export const actions: ActionTree<LocalNavigation, State> = {
    setActive({ commit, state }, id: string) {
        const event: LocalNavigationEvent = {
            type: 'activeChanged',
            newValue: id,
            oldValue: state.active
        };

        commit('APPLY', event);
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
            rootState.app.globalNavigation.active != null &&
            typeof rootState.app.globalNavigation.active !== 'string'
        ) {
            active = {
                id: rootState.app.globalNavigation.active.id,
                type: rootState.app.globalNavigation.active.type
            };
        }

        const event: LocalNavigationEvent = {
            type: 'noteInputStarted',
            active,
            note
        };

        commit('APPLY', event);
    },
    noteInputUpdate({ commit, state }, value: string) {
        const event: LocalNavigationEvent = {
            type: 'noteInputUpdated',
            newValue: value,
            oldValue: state.notes.input.name
        };

        commit('APPLY', event);
    },
    noteInputConfirm({ commit, state }) {
        const note: Note = Object.assign({} as Note, state.notes.input);

        switch (state.notes.input.mode) {
            case 'create':
                commit('notes/CREATE', note, { root: true });
                break;

            case 'update':
                note.dateModified = new Date();
                commit('notes/NAME', note, { root: true });
                break;
        }

        const event: LocalNavigationEvent = {
            type: 'noteInputCleared',
            oldValue: note
        };

        commit('APPLY', event);
    },
    noteInputCancel({ commit, state }) {
        const event: LocalNavigationEvent = {
            type: 'noteInputCleared',
            oldValue: state.notes.input
        };

        commit('APPLY', event);
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
        const e: LocalNavigationEvent = {
            type: 'widthUpdated',
            newValue: width,
            oldValue: state.width
        };

        commit('APPLY', e);
    }
};
