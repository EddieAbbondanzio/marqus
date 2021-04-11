import { MutationTree } from 'vuex';
import { GlobalNavigation } from '@/store/modules/app/modules/global-navigation/state';
import { Notebook } from '@/store/modules/notebooks/state';
import { id as generateId } from '@/utils/id';

export const mutations: MutationTree<GlobalNavigation> = {
    TAGS_EXPANDED(s, e = true) {
        s.tags.expanded = e;
    },
    TAGS_SORT(s) {
        s.tags.entries.sort((a, b) => a.value.localeCompare(b.value));
    },
    TAG_INPUT_VALUE(s, value: string) {
        s.tags.input.value = value;
    },
    TAG_INPUT_START(s, id: string | null = null) {
        // Create
        if (id == null) {
            s.tags.input = {};
            s.tags.input.id = generateId();
            s.tags.input.mode = 'create';
        }
        // Update
        else {
            const t = s.tags.entries.find((t) => t.id === id)!;
            s.tags.input.id = t.id;
            s.tags.input.value = t.value;
            s.tags.input.mode = 'update';
        }
    },
    TAG_INPUT_CONFIRM(s) {
        if (s.tags.input === {} || s.tags.input.value == null || s.tags.input.id == null) {
            throw new Error('Invalid state.');
        }

        const existing = s.tags.entries.find((t) => t.id === s.tags.input.id);

        if (existing == null) {
            s.tags.entries.push({
                id: s.tags.input.id,
                value: s.tags.input.value
            });
        } else {
            existing.value = s.tags.input.value;
        }

        s.tags.input = {};
    },
    TAG_INPUT_CANCEL(s) {
        s.tags.input = {};
    }
    // OLD
    // SET_NOTEBOOK_EXPAND(s, { id, value }: { id: string; value: boolean }) {
    //     const n = findNotebookRecursive(s.notebooks.entries, id);

    //     if (n == null) {
    //         throw new Error('Cannot expand what we cannot find');
    //     }

    //     n.expanded = value;
    // },
    // EXPAND_NOTEBOOKS: (s) => (s.notebooks.expanded = true),
    // DRAG_NOTEBOOK_START(state, dragging: Notebook) {
    //     state.notebooks.dragging = dragging;
    // },
    // DRAG_NOTEBOOK_STOP(state, endedOnId: string | null) {
    //     const dragging = state.notebooks.dragging;

    //     if (dragging == null) {
    //         throw new Error('No drag to finalize.');
    //     }

    //     /*
    //      * Don't allow a move if we started and stopped on the same element, or if
    //      * we are attempting to move a parent to a child of it.
    //      */
    //     if (dragging.id !== endedOnId && findNotebookRecursive(dragging.children!, endedOnId!) == null) {
    //         // Remove from old parent if needed
    //         if (dragging.parent != null) {
    //             const oldIndex = dragging.parent.children!.findIndex((c) => c.id === dragging.id);
    //             dragging.parent.children!.splice(oldIndex, 1);

    //             if (dragging.parent.children?.length === 0) {
    //                 dragging.parent.expanded = false;
    //             }
    //         }
    //         // No parent, we gotta remove it from the root array
    //         else {
    //             const oldIndex = state.notebooks.entries.findIndex((n) => n.id === dragging.id);
    //             state.notebooks.entries.splice(oldIndex, 1);
    //         }

    //         // Didn't end on a notebook. Assume it should be placed in root.
    //         if (endedOnId == null) {
    //             state.notebooks.entries.push(dragging);
    //         } else {
    //             const endedOn = findNotebookRecursive(state.notebooks.entries, endedOnId)!;

    //             if (endedOn.children == null) {
    //                 endedOn.children = [];
    //             }

    //             dragging.parent = endedOn;
    //             endedOn.children.push(dragging);
    //         }
    //     }

    //     state.notebooks.dragging = undefined;
    // }
};

// function findNotebookRecursive(notebooks: Notebook[], id: string): Notebook | undefined {
//     if (notebooks == null) {
//         return undefined;
//     }

//     for (let i = 0; i < notebooks.length; i++) {
//         if (notebooks[i].id === id) {
//             return notebooks[i];
//         } else if (notebooks[i].children?.length) {
//             const r = findNotebookRecursive(notebooks[i].children!, id);

//             if (r != null) {
//                 return r;
//             }
//         }
//     }
// }
