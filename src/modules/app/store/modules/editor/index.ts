import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
// import { mutations } from './mutations';
import { mediator } from '@/core/store/plugins/mediator/mediator';

export default {
    namespaced: true,
    state,
    getters,
    actions
    // mutations
};

mediator.subscribe('app/localNavigation/APPLY', ({ payload }, store) => {
    if (payload.type !== 'activeChanged') {
        return;
    }

    const noteId = payload.newValue;

    const existingTab = store.state.app.editor.tabs.values.find((t) => t.noteId === noteId);

    if (existingTab != null) {
        store.dispatch('app/editor/tabSwitch', existingTab.id);
    } else {
        store.dispatch('app/editor/tabOpen', noteId);
    }
});
