import { Editor, EditorMode, Tab } from '@/store/modules/app/modules/editor/state';
import { Note } from '@/store/modules/notes/state';
import { State } from '@/store/state';
import { confirmDeleteOrTrash } from '@/utils/prompts/confirm-delete-or-trash';
import { ActionTree } from 'vuex';

export const actions: ActionTree<Editor, State> = {
    tabDragStart({ commit }, tab: Tab) {
        commit('ACTIVE', tab.id); // We set it as active, to render it nicer on cursor dragging
        commit('TAB_DRAGGING', tab);
    },
    tabDragStop({ commit }, newIndex: number) {
        commit('TAB_DRAGGING_NEW_INDEX', newIndex);
        commit('TAB_DRAGGING');
    },
    tabSwitch({ commit, state }, tabId: string) {
        commit('ACTIVE', tabId);
        commit('RESET_TAB', state.tabs.active);
    },
    async deleteActiveNote({ commit, rootState, rootGetters }) {
        const { id } = rootGetters['app/editor/activeNote'] as Note;
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
    toggleMode({ commit, state }) {
        let newMode: EditorMode;

        switch (state.mode) {
            case 'view':
                newMode = 'edit';
                break;

            case 'edit':
                newMode = 'view';
                break;
            case 'split':
            case 'zen':
                newMode = state.mode;
                break;
        }

        commit('MODE', newMode);
    }
};
