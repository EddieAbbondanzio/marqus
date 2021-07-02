import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { mediator } from '@/store/plugins/mediator/mediator';
import { undo } from '@/store/plugins/undo/undo';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

mediator.subscribe('ui/localNavigation/APPLY', ({ payload }, store) => {
    if (payload.type !== 'activeChanged') {
        return;
    }

    const noteId = payload.newValue;

    const existingTab = store.state.ui.editor.tabs.values.find((t) => t.noteId === noteId);

    if (existingTab != null) {
        store.dispatch('ui/editor/tabSwitch', existingTab.id);
    } else {
        store.dispatch('ui/editor/tabOpen', noteId);
    }
});

undo.registerModule(state, {
    name: 'editor',
    namespace: 'ui/editor',
    setStateMutation: 'SET_STATE',
    stateCacheInterval: 1000
});
