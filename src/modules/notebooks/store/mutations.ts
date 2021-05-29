import { MutationTree } from 'vuex';
import { NotebookState } from './state';
import { generateId } from '@/core/store/entity';
import { Notebook } from '@/modules/notebooks/common/notebook';

export const mutations: MutationTree<NotebookState> = {
    INIT(state, s: NotebookState) {
        Object.assign(state, s);
    },
    CREATE(
        state,
        {
            id,
            value,
            parent,
            children,
            expanded
        }: { id?: string; value: string; parent?: Notebook; children?: Notebook[]; expanded?: boolean }
    ) {
        if (value == null) {
            throw Error('Value is required.');
        }

        const notebook = {
            id: id ?? generateId(),
            value,
            parent,
            children,
            expanded: expanded ?? false
        };

        if (parent != null) {
            // Jest doesn't like logical assignments ??=
            if (parent.children == null) {
                parent.children = [];
            }

            parent.children.push(notebook);
        } else {
            state.values.push(notebook);
        }
    },
    UPDATE(state, { id, value }: { id: string; value: string }) {
        const notebook = findNotebookRecursive(state.values, id);

        if (notebook == null) {
            throw Error(`No notebook with id ${id} found.`);
        }

        if (value == null) {
            throw Error('Value is required.');
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

        // Remove option to expand / collapse notebook when no children.
        if (notebook.parent != null && notebook.parent.children!.length === 0) {
            delete notebook.parent.children;
            notebook.parent.expanded = false;
        }
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
    },
    EXPANDED(
        s,
        { notebook, expanded = true, bubbleUp = false }: { notebook: Notebook; expanded: boolean; bubbleUp: boolean }
    ) {
        let p: Notebook | undefined = notebook;

        // Run up the tree expanding each parent until we hit the root
        do {
            p.expanded = expanded;
            p = p.parent;
        } while (p && bubbleUp);
    },
    ALL_EXPANDED(s, e = false) {
        for (let i = 0; i < s.values.length; i++) {
            recursiveStep(s.values[i], e);
        }

        function recursiveStep(n: Notebook, e: boolean) {
            n.expanded = e;

            if (n.children == null) {
                return;
            }

            for (let i = 0; i < n.children.length; i++) {
                recursiveStep(n.children[i], e);
            }
        }
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
