import { Notebook } from '@/modules/notebooks/common/notebook';
import { Note } from '@/modules/notes/common/note';
import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { NotebookState } from './state';

export const getters: GetterTree<NotebookState, State> = {
    /**
     * Flatten the tree structure of all the notebooks into a 1d array.
     */
    flatten: (s) => {
        const visited: { [i: string]: Notebook | undefined } = {};

        const recursiveStep = (toVisit: Notebook[]) => {
            for (const notebook of toVisit) {
                // Skip if we already visited it.
                if (visited[notebook.id] != null) {
                    continue;
                }

                // Insert it
                visited[notebook.id] = notebook;

                // Does it have children to visit?
                if (notebook.children != null) {
                    recursiveStep(notebook.children);
                }
            }
        };

        recursiveStep(s.values);
        return Object.values(visited);
    },
    notebooksForNote: (s) => (note: Note) => {
        if (note == null) {
            return [];
        }

        const notebooks = (getters as any).flatten(s);
        const res = notebooks.filter((n: any) => note.notebooks.some((notebookId: string) => notebookId === n.id));
        return res;
    }
};
