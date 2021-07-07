import { MutationTree } from 'vuex';
import { NotebookState } from './state';
import { Notebook } from '@/features/notebooks/common/notebook';
import { generateId } from '@/store';
import { isBlank } from '@/shared/utils/string/is-blank';
import { findNotebookRecursive } from '@/features/notebooks/common/find-notebook-recursive';

export const mutations: MutationTree<NotebookState> = {
    SET_STATE(state, s: NotebookState) {
        Object.assign(state, s);
    },
    CREATE(state, props: { id: string; value: string; parent?: Notebook; children?: Notebook[]; expanded?: boolean }) {
        // Check that the name isn't null, or just whitespace.
        if (isBlank(props.value)) {
            throw Error('Value is required.');
        }

        const notebook: Notebook = Object.assign({}, props);

        if (props.parent != null) {
            // Jest doesn't like logical assignments ??=
            if (props.parent.children == null) {
                props.parent.children = [];
            }

            props.parent.children.push(notebook);
        } else {
            state.values.push(notebook);
        }
    },
    SET_NAME(state, { id, value }: { id: string; value: string }) {
        const notebook = findNotebookRecursive(state.values, id);

        if (notebook == null) {
            throw Error(`No notebook with id ${id} found.`);
        }

        if (value == null) {
            throw Error('Value is required.');
        }

        notebook.value = value;
    },
    DELETE(state, { id }: { id: string }) {
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
    SET_EXPANDED(
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
    SET_ALL_EXPANDED(s, e = false) {
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
