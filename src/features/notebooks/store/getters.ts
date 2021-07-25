import { findNotebookRecursive } from '@/features/notebooks/common/find-notebook-recursive';
import { Notebook } from '@/features/notebooks/common/notebook';
import { Note } from '@/features/notes/common/note';
import { Tag } from '@/features/tags/common/tag';
import { Getters } from 'vuex-smart-module';
import { NotebookState } from './state';

export class NotebookGetters extends Getters<NotebookState> {
    /**
     * Flatten the tree structure of all the notebooks into a 1d array.
     */
    get flatten() {
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

        recursiveStep(this.state.values);
        return Object.values(visited);
    }

    get notebooksForNote() {
        return (note: Note) => {
            if (note == null) {
                return [];
            }

            const notebooks = this.flatten;
            const res = notebooks.filter((n: any) => note.notebooks.some((notebookId: string) => notebookId === n.id));
            return res;
        };
    }

    get byId() {
        return (id: string) => {
            const notebook = findNotebookRecursive(this.state.values, id);
            return notebook;
        };
    }
}
