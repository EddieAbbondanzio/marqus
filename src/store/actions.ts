import path from 'path';
import { ActionTree } from 'vuex';
import { Notebook } from './modules/notebooks/state';
import { State } from './state';

const saving: { current?: Promise<any>; next?: () => Promise<any> } = {};

export const actions: ActionTree<State, any> = {
    startup: function(c) {
        // Create data directory if needed.
        // if (!doesPathExist(DATA_DIRECTORY)) {
        //     createDirectory(DATA_DIRECTORY);
        // }

        // Create the note directory if needed.
        // TODO: Move this to notes store
        // const noteDirectory = path.join(DATA_DIRECTORY, 'notes');
        // if (!doesPathExist(noteDirectory)) {
        //     createDirectory(noteDirectory);
        // }

        c.dispatch('config/load');
        c.dispatch('load');
    },
    async load(context) {
        // const filePath = path.join(DATA_DIRECTORY, STATE_FILE_NAME);
        // if (doesPathExist(filePath)) {
        //     const state = await loadJsonFile(filePath);
        //     // Fix .parent of notebooks
        //     if (state.notebooks.values?.length > 0) {
        //         for (let i = 0; i < state.notebooks.values.length; i++) {
        //             fixNotebookParentReferences(state.notebooks.values[i]);
        //         }
        //     }
        //     this.commit('STATE', state);
        // }
    },
    async save(context) {
        // const dataDirectory = context.rootState.config.dataDirectory;
        // const filePath = path.join(dataDirectory, STATE_FILE_NAME);
        // // Deep copy so we can purge some data without effecting vuex
        // const state = JSON.parse(
        //     JSON.stringify(context.state, (k, v) => {
        //         // Don't save off notebook parents
        //         if (k === 'parent') {
        //             return undefined;
        //         } else {
        //             return v;
        //         }
        //     })
        // );
        // Don't save notebook input
        // if (state.app.globalNavigation.notebooks) {
        //     delete state.app.globalNavigation.notebooks.dragging;
        //     delete state.app.globalNavigation.notebooks.input;
        // }
        // // Don't save tag input
        // if (state.app.globalNavigation.tags) {
        //     delete state.app.globalNavigation.tags.input;
        // }
        // delete state.dirty;
        /*
         * There be dragons here. This is written in a way to prevent a
         * race condition from occuring when writing the file. Race conditions
         * will corrupt the JSON because more than 1 process is writing the
         * file at the same time causing for overlaps, etc.
         */
        // if (saving.current == null) {
        //     saving.current = writeJsonFile(filePath, state);
        //     context.commit('CLEAN');
        // } else if (saving.next == null) {
        //     saving.next = () => writeJsonFile(filePath, state);
        // }
        // // Save current
        // await saving.current;
        // delete saving.current;
        // // Save next, if needed
        // if (saving.next != null) {
        //     saving.next();
        //     delete saving.next;
        // }
    }
};

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
