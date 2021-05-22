import { generateId } from '@/store/core/entity';
import { MutationTree } from 'vuex';
import { Notebook } from '../notebooks/state';
import { AppState } from './state';

export const mutations: MutationTree<AppState> = {
    INIT(state, s: AppState) {
        Object.assign(state, s);
    },
    SET_CURSOR_ICON(state, icon: string) {
        state.cursor.icon = icon;
    },
    RESET_CURSOR_ICON(state) {
        state.cursor.icon = 'pointer';
    },
    CURSOR_DRAGGING(state, dragging) {
        state.cursor.dragging = dragging;
    }
};
