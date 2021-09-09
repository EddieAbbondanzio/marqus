import { findNotebookRecursive } from '@/features/notebooks/shared/find-notebook-recursive';
import { Notebook } from '@/features/notebooks/shared/notebook';
import { Note } from '@/features/notes/common/note';
import { Tag } from '@/features/tags/shared/tag';
import { Getters } from 'vuex-smart-module';
import { NotebookState } from './state';

export class NotebookGetters extends Getters<NotebookState> {
    get count() {
        return this.getters.flatten.length;
    }

    /**
     * Flatten the tree structure of all the notebooks into a 1d array.
     */
    get flatten() {
        const visited: { [i: string]: Notebook } = {};

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

    get flattenVisible() {
        const visited: { [i: string]: Notebook } = {};

        const recursiveStep = (toVisit: Notebook[]) => {
            for (const notebook of toVisit) {
                // Skip if we already visited it.
                if (visited[notebook.id] != null) {
                    continue;
                }

                // Insert it
                visited[notebook.id] = notebook;

                // Does it have children to visit?
                if (notebook.children != null && notebook.expanded) {
                    recursiveStep(notebook.children);
                }
            }
        };

        recursiveStep(this.state.values);
        return Object.values(visited);
    }

    first() {
        return this.state.values[0];
    }

    last() {
        const visible = this.getters.flattenVisible;

        if (visible.length === 0) {
            return null;
        }

        return visible[visible.length - 1];
    }

    getNext(id: string) {
        const visible = this.getters.flattenVisible;
        const index = visible.findIndex((n) => n.id === id);

        if (index >= visible.length - 1) {
            return null;
        }

        return visible[index + 1];
    }

    getPrevious(id: string) {
        const visible = this.getters.flattenVisible;
        const index = visible.findIndex((n) => n.id === id);

        if (index <= 0) {
            return null;
        }

        return visible[index - 1];
    }

    notebooksForNote(note: Note) {
        if (note == null) {
            return [];
        }

        const notebooks = this.getters.flatten;
        const res = notebooks.filter((n: any) => note.notebooks.some((notebookId: string) => notebookId === n.id));
        return res;
    }

    byId(id: string): Notebook | undefined;
    byId(id: string, opts: { required: true }): Notebook;
    byId(id: string, opts: { required?: boolean } = {}) {
        const notebook = findNotebookRecursive(this.state.values, id);

        if (opts.required && notebook == null) {
            throw Error(`No notebook with id ${id} found.`);
        }

        return notebook;
    }
}
