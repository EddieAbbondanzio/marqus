import { State } from '@/store/state';
import { fileSystem } from '@/utils/file-system';
import path from 'path';
import { ActionTree } from 'vuex';
import { AppState, state } from './state';

export const actions: ActionTree<AppState, State> = {
    cursorDraggingStart({ commit }) {
        commit('SET_CURSOR_ICON', 'grabbing');
        commit('CURSOR_DRAGGING', true);
    },
    cursorDraggingStop({ commit }) {
        commit('RESET_CURSOR_ICON');
        commit('CURSOR_DRAGGING', false);
    }
};
