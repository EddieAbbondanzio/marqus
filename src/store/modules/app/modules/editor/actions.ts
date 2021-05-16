import { Editor, Tab } from '@/store/modules/app/modules/editor/state';
import { State } from '@/store/state';
import { ActionTree } from 'vuex';

export const actions: ActionTree<Editor, State> = {
    tabDragStart({ commit }, tab: Tab) {
        commit('ACTIVE', tab.id); // We set it as active, to render it nicer on cursor dragging
        commit('TAB_DRAGGING', tab);
    },
    tabDragStop({ commit }, newIndex: number) {
        commit('TAB_DRAGGING_NEW_INDEX', newIndex);
        commit('TAB_DRAGGING');
    }
};
