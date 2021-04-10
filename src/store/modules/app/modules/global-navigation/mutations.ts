import { MutationTree } from 'vuex';
import { GlobalNavigation } from '@/store/modules/app/modules/global-navigation/state';
import { Notebook } from '@/store/modules/notebooks/state';

function findNotebookRecursive(notebooks: Notebook[], id: string): Notebook | undefined {
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

export const mutations: MutationTree<GlobalNavigation> = {
    CREATE_TAG(s) {
        s.tags.input = {};
        s.tags.input.mode = 'create';
    },
    SET_TAGS_EXPANDED(s, e) {
        s.tags.expanded = e;
    },
    SET_NOTEBOOK_EXPAND(s, { id, value }: { id: string; value: boolean }) {
        const n = findNotebookRecursive(s.notebooks.entries, id);

        if (n == null) {
            throw new Error('Cannot expand what we cannot find');
        }

        n.expanded = value;
    },
    EXPAND_NOTEBOOKS: (s) => (s.notebooks.expanded = true),
    DRAG_NOTEBOOK_START(state, dragging: Notebook) {
        state.notebooks.dragging = dragging;
    },
    DRAG_NOTEBOOK_STOP(state, endedOnId: string | null) {
        const dragging = state.notebooks.dragging;

        if (dragging == null) {
            throw new Error('No drag to finalize.');
        }

        /*
         * Don't allow a move if we started and stopped on the same element, or if
         * we are attempting to move a parent to a child of it.
         */
        if (dragging.id !== endedOnId && findNotebookRecursive(dragging.children!, endedOnId!) == null) {
            // Remove from old parent if needed
            if (dragging.parent != null) {
                const oldIndex = dragging.parent.children!.findIndex((c) => c.id === dragging.id);
                dragging.parent.children!.splice(oldIndex, 1);

                if (dragging.parent.children?.length === 0) {
                    dragging.parent.expanded = false;
                }
            }
            // No parent, we gotta remove it from the root array
            else {
                const oldIndex = state.notebooks.entries.findIndex((n) => n.id === dragging.id);
                state.notebooks.entries.splice(oldIndex, 1);
            }

            // Didn't end on a notebook. Assume it should be placed in root.
            if (endedOnId == null) {
                state.notebooks.entries.push(dragging);
            } else {
                const endedOn = findNotebookRecursive(state.notebooks.entries, endedOnId)!;

                if (endedOn.children == null) {
                    endedOn.children = [];
                }

                dragging.parent = endedOn;
                endedOn.children.push(dragging);
            }
        }

        state.notebooks.dragging = undefined;
    }
};
