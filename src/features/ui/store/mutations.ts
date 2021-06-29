import { MutationTree } from 'vuex';
import { UserInterface } from './state';

export const mutations: MutationTree<UserInterface> = {
    SET_STATE(state, s: UserInterface) {
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
