import { Notebook, NotebookState, state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { persist } from '@/store/plugins/persist/persist';

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
    initiMutation: 'INIT',
    reviver: (s: NotebookState) => {
        for (const n of s.values) {
            fixNotebookParentReferences(n);
        }

        console.log(s);

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

/**
 * Recursively iterate notebooks and rebuilt their .parent references.
 * @param notebook The notebook to start at
 */
export function fixNotebookParentReferences(notebook: Notebook) {
    // Base case
    if (notebook.children == null || notebook.children.length === 0) {
        return;
    }

    // Recursive step
    for (let i = 0; i < notebook.children.length; i++) {
        const child = notebook.children[i];
        child.parent = notebook;

        fixNotebookParentReferences(child);
    }
}

export function killNotebookParentReferences(notebook: Notebook) {
    // Base case
    if (notebook.children == null || notebook.children.length === 0) {
        return;
    }

    // Recursive step
    for (let i = 0; i < notebook.children.length; i++) {
        const child = notebook.children[i];
        delete child.parent;

        killNotebookParentReferences(child);
    }
}
