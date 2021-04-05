import { id } from '@/utils/id';
import { MutationTree } from 'vuex';
import { Notebook } from '../notebooks/state';
import { AppState } from './state';

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

export const mutations: MutationTree<AppState> = {
    UPDATE_STATE: (state, kv: { key: string; value: any }) => {
        // i = 'a.b.c' -> a['a']['b']['c'] = v
        const recurse = (a: any, i: string, v: any) => {
            if (i.indexOf('.') < 0) {
                a[i] = v;
                return;
            }

            const split = i.split('.');
            const localI = split.shift()!;
            recurse(a[localI], split.join('.'), v);
        };

        recurse(state, kv.key, kv.value);
    },

    SET_NOTEBOOK_EXPAND(s, { id, value }: { id: string; value: boolean }) {
        const n = findNotebookRecursive(s.globalNavigation.notebooks.entries, id);

        if (n == null) {
            throw new Error('Cannot expand what we cannot find');
        }

        n.expanded = value;
    },
    EXPAND_NOTEBOOKS: (s) => (s.globalNavigation.notebooks.expanded = true),

    DRAG_NOTEBOOK_START(state, dragging: Notebook) {
        state.globalNavigation.notebooks.dragging = dragging;
    },
    DRAG_NOTEBOOK_STOP(state, endedOnId: string | null) {
        const dragging = state.globalNavigation.notebooks.dragging;

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
                const oldIndex = state.globalNavigation.notebooks.entries.findIndex((n) => n.id === dragging.id);
                state.globalNavigation.notebooks.entries.splice(oldIndex, 1);
            }

            // Didn't end on a notebook. Assume it should be placed in root.
            if (endedOnId == null) {
                state.globalNavigation.notebooks.entries.push(dragging);
            } else {
                const endedOn = findNotebookRecursive(state.globalNavigation.notebooks.entries, endedOnId)!;

                if (endedOn.children == null) {
                    endedOn.children = [];
                }

                dragging.parent = endedOn;
                endedOn.children.push(dragging);
            }
        }

        state.globalNavigation.notebooks.dragging = undefined;
    },
    SET_CURSOR_TITLE(state, title: string) {
        state.cursor.title = title;
    },
    CLEAR_CURSOR_TITLE(state) {
        state.cursor.title = undefined;
    },
    SET_CURSOR_ICON(state, icon: string) {
        state.cursor.icon = icon;
    },
    RESET_CURSOR_ICON(state) {
        state.cursor.icon = 'pointer';
    }
};
