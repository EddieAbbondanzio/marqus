import { NotebookState, state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { persist } from '@/store/plugins/persist/persist';
import { fixNotebookParentReferences, killNotebookParentReferences } from '@/features/notebooks/common/notebook';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

persist.register({
    namespace: 'notebooks',
    fileName: 'notebooks.json',
    initMutation: 'INIT',
    reviver: (s: NotebookState) => {
        for (const n of s.values) {
            fixNotebookParentReferences(n);
        }

        return s;
    },
    transformer: (s: NotebookState) => {
        /*
         * Need to nuke .parent references before serializing else JSON.strigify
         * will throw error due to circular references.
         */
        for (const n of s.values) {
            killNotebookParentReferences(n);
        }

        return s;
    }
});
