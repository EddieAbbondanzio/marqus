import { EditorActions } from '@/features/ui/store/modules/editor/actions';
import { EditorGetters } from '@/features/ui/store/modules/editor/getters';
import { EditorMutations } from '@/features/ui/store/modules/editor/mutations';
import { EditorState } from '@/features/ui/store/modules/editor/state';
import { mediator } from '@/store/plugins/mediator/mediator';
import { undo } from '@/store/plugins/undo/undo';
import { Module } from 'vuex-smart-module';

export const editor = new Module({
    namespaced: true,
    actions: EditorActions,
    state: EditorState,
    mutations: EditorMutations,
    getters: EditorGetters
});

mediator.subscribe('ui/localNavigation/APPLY', ({ payload }, store) => {
    if (payload.type !== 'activeChanged') {
        return;
    }

    const noteId = payload.newValue;

    const existingTab = store.state.ui.editor.tabs.values.find((t: any) => t.noteId === noteId);

    if (existingTab != null) {
        store.dispatch('ui/editor/tabSwitch', existingTab.id);
    } else {
        store.dispatch('ui/editor/tabOpen', noteId);
    }
});

undo.registerModule(new EditorState(), {
    name: 'editor',
    namespace: 'ui/editor',
    setStateMutation: 'SET_STATE',
    stateCacheInterval: 1000
});
