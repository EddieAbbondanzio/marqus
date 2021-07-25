import { MutationTree } from 'vuex';
import { NotebookState } from './state';
import { Notebook } from '@/features/notebooks/common/notebook';
import { generateId } from '@/store';
import { findNotebookRecursive } from '@/features/notebooks/common/find-notebook-recursive';
import { isBlank } from '@/shared/utils';
import { Mutations } from 'vuex-smart-module';
import { UndoPayload, VoidUndoPayload } from '@/store/plugins/undo';

export type NotebookCreate = Pick<Notebook, 'id' | 'value' | 'parent' | 'children' | 'expanded'>;

export class NotebookMutations extends Mutations<NotebookState> {
    SET_STATE(s: NotebookState) {
        Object.assign(this.state, s);
    }

    CREATE(p: UndoPayload<NotebookCreate>) {
        // Check that the name isn't null, or just whitespace.
        if (isBlank(p.value.value)) {
            throw Error('Value is required.');
        }

        const notebook: Notebook = Object.assign({}, p.value);

        if (p.value.parent != null) {
            p.value.parent.children ??= [];
            p.value.parent.children.push(notebook);
        } else {
            this.state.values.push(notebook);
        }
    }

    SET_NAME({ value: { notebook, newName } }: UndoPayload<{ notebook: Notebook; newName: string }>) {
        if (newName == null) {
            throw Error('Value is required.');
        }

        notebook.value = newName;
    }

    DELETE({ value: { id } }: UndoPayload<Pick<Notebook, 'id'>>) {
        const notebook = findNotebookRecursive(this.state.values, id);

        if (notebook == null) {
            throw new Error(`No notebook with id ${id} found.`);
        }

        const array = notebook.parent == null ? this.state.values : notebook.parent!.children!;
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
    }

    SORT(p: VoidUndoPayload) {
        // Sort nested
        recursiveSort(this.state.values);

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
        this.state.values.sort((a, b) => a.value.localeCompare(b.value));
    }

    SET_EXPANDED(payload: UndoPayload<{ notebook: Notebook; expanded: boolean; bubbleUp: boolean }>) {
        let n: Notebook | undefined = payload.value.notebook;

        // Run up the tree expanding each parent until we hit the root
        do {
            n.expanded = payload.value.expanded;
            n = n.parent;
        } while (n && payload.value.bubbleUp);
    }

    SET_ALL_EXPANDED({ value: { expanded = false } }: UndoPayload<{ expanded: boolean }>) {
        for (let i = 0; i < this.state.values.length; i++) {
            recursiveStep(this.state.values[i], expanded);
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
}
