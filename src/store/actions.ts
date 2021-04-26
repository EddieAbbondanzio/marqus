import path from 'path';
import { ActionTree } from 'vuex';
import { Notebook } from './modules/notebooks/state';
import { State } from './state';

const saving: { current?: Promise<any>; next?: () => Promise<any> } = {};

export const actions: ActionTree<State, any> = {};

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
