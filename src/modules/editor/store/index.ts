import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { mediator } from '@/core/store/plugins/mediator/mediator';
import { shortcutManager } from '@/modules/shortcuts/directives/shortcut';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

mediator.subscribe('app/localNavigation/ACTIVE', ({ payload: noteId }, store) => {
    const existingTab = store.state.app.editor.tabs.values.find((t) => t.noteId === noteId);

    if (existingTab != null) {
        store.dispatch('app/editor/tabSwitch', existingTab.id);
    } else {
        store.dispatch('app/editor/tabOpen', noteId);
    }
});
