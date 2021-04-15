import { MutationTree } from 'vuex';
import { Notebook, NotebookState } from './state';
import { id as generateId } from '@/utils/id';

export const mutations: MutationTree<NotebookState> = {
    CREATE(state, { id, value, parent }: { id?: string; value: string; parent?: Notebook }) {
        const notebook = {
            id: id ?? generateId(),
            value,
            parent,
            expanded: false
        };

        state.values.push(notebook);

        if (parent != null) {
            // Jest doesn't like logical assignments ??=
            if (parent.children == null) {
                parent.children = [];
            }

            parent.children.push(notebook);
        }
    },
    UPDATE(state, { id, value }: { id: string; value: string }) {
        const notebook = findNotebookRecursive(state.values, id);

        if (notebook == null) {
            throw new Error(`No notebook with id ${id} found.`);
        }

        notebook.value = value;
    },
    DELETE(state, id: string) {
        const notebook = findNotebookRecursive(state.values, id);

        if (notebook == null) {
            throw new Error(`No notebook with id ${id} found.`);
        }

        const array = notebook.parent == null ? state.values : notebook.parent!.children!;
        const index = array.findIndex((n) => n.id === id);

        if (index === -1) {
            throw new Error(`No notebook with id ${id} found.`);
        }

        array.splice(index, 1);
    },
    SORT(state) {
        // Sort nested
        recursiveSort(state.values);

        function recursiveSort(notebooks: Notebook[]) {
            for (let i = 0; i < notebooks.length; i++) {
                const n = notebooks[i];

                if (n.children != null) {
                    n.children.sort((a, b) => a.value.localeCompare(b.value));
                    recursiveSort(n.children);
                }
            }
        }

        // Sort root
        state.values.sort((a, b) => a.value.localeCompare(b.value));
    }
};

/**
 * Search through a group of notebooks, and their children in an attempt
 * to find a notebook via it's id.
 * @param notebooks Collection of notebooks to look in.
 * @param id The id to look for.
 * @returns The matching notebook (if any)
 */
export function findNotebookRecursive(notebooks: Notebook[], id: string): Notebook | undefined {
    if (notebooks == null) {
        return undefined;
    }

    for (let i = 0; i < notebooks.length; i++) {
        if (notebooks[i].id === id) {
            return notebooks[i];
        } else if (notebooks[i].children?.length) {
            const r = findNotebookRecursive(notebooks[i].children!, id);

            if (r != null) {
                return r;
            }
        }
    }
}
