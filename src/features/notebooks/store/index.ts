import { persist } from '@/store/plugins/persist/persist';
import { fixNotebookParentReferences, killNotebookParentReferences } from '@/features/notebooks/common/notebook';
import { createComposable, Module } from 'vuex-smart-module';
import { NotebookActions } from '@/features/notebooks/store/actions';
import { NotebookState } from '@/features/notebooks/store/state';
import { NotebookMutations } from '@/features/notebooks/store/mutations';
import { NotebookGetters } from '@/features/notebooks/store/getters';
import { undo } from '@/store/plugins/undo';

export const notebooks = new Module({
    namespaced: true,
    actions: NotebookActions,
    state: NotebookState,
    mutations: NotebookMutations,
    getters: NotebookGetters
});

export const useNotebooks = createComposable(notebooks);

persist.register({
    namespace: 'notebooks',
    fileName: 'notebooks.json',
    initMutation: 'SET_STATE',
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
