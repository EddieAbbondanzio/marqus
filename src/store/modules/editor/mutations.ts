import { id } from '@/utils/id';
import { MutationTree } from 'vuex';
import { EditorState, Notebook, Tag } from './state';

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

export const mutations: MutationTree<EditorState> = {
    TOGGLE_MODE: (s, p) => (s.mode = s.mode === 'edit' ? 'view' : 'edit'),
    SET_STATE: (state, config) => {
        Object.assign(state, config);
        state.loaded = true;
    },
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
    EXPAND_TAGS: (s) => (s.globalNavigation.tags.expanded = true),
    CREATE_TAG(state) {
        state.globalNavigation.tags.input = {
            id: id(),
            value: '',
            mode: 'create'
        };
    },
    CREATE_TAG_CONFIRM(state) {
        if (state.globalNavigation.tags.input.value == null) {
            throw new Error('Invalid tag data');
        }

        const t: Tag = {
            id: state.globalNavigation.tags.input.id!,
            value: state.globalNavigation.tags.input.value
        };

        state.globalNavigation.tags.entries.push(t);
        state.globalNavigation.tags.input = {};
    },
    CREATE_TAG_CANCEL(state) {
        state.globalNavigation.tags.input = {};
    },
    UPDATE_TAG(state, id: string) {
        const tag = state.globalNavigation.tags.entries.find((t) => t.id === id);

        if (tag == null) {
            throw new Error(`No tag found with id: ${id}`);
        }

        state.globalNavigation.tags.input = { mode: 'update', ...tag };
    },
    UPDATE_TAG_CONFIRM(state) {
        if (state.globalNavigation.tags.input.value == null) {
            throw new Error('Invalid tag data');
        }

        const tag = state.globalNavigation.tags.entries.find((t) => t.id === state.globalNavigation.tags.input.id)!;
        tag.value = state.globalNavigation.tags.input.value;

        state.globalNavigation.tags.input = {};
    },
    UPDATE_TAG_CANCEL(state) {
        state.globalNavigation.tags.input = {};
    },
    SORT_TAGS(state) {
        state.globalNavigation.tags.entries.sort((a, b) => a.value.toUpperCase().localeCompare(b.value.toUpperCase()));
    },
    DELETE_TAG(state, id) {
        const index = state.globalNavigation.tags.entries.findIndex((t) => t.id === id);

        if (index === -1) {
            throw new Error('No tag found');
        }

        state.globalNavigation.tags.entries.splice(index, 1);
    },
    DELETE_ALL_TAGS(state) {
        state.globalNavigation.tags.entries.length = 0;
    },
    SET_NOTEBOOK_EXPAND(s, { id, value }: { id: string; value: boolean }) {
        const n = findNotebookRecursive(s.globalNavigation.notebooks.entries, id);

        if (n == null) {
            throw new Error('Cannot expand what we cannot find');
        }

        n.expanded = value;
    },
    EXPAND_NOTEBOOKS: (s) => (s.globalNavigation.notebooks.expanded = true),
    CREATE_NOTEBOOK(state, parentId?: string) {
        state.globalNavigation.notebooks.input = {
            id: id(),
            value: '',
            mode: 'create',
            parentId
        };
    },
    CREATE_NOTEBOOK_CONFIRM(state) {
        if (state.globalNavigation.notebooks.input.value == null) {
            throw new Error('Invalid tag data');
        }

        const { id, value, parentId } = state.globalNavigation.notebooks.input as Notebook & { parentId?: string };

        const n: Notebook = {
            id,
            value,
            expanded: false
        };

        if (parentId == null) {
            state.globalNavigation.notebooks.entries.push(n);
        } else {
            const parent = state.globalNavigation.notebooks.entries.find((p) => p.id === parentId)!;

            if (parent.children == null) {
                parent.children = [];
            }

            parent.children.push(n);
        }

        state.globalNavigation.notebooks.input = {};
    },
    CREATE_NOTEBOOK_CANCEL(state) {
        state.globalNavigation.notebooks.input = {};
    },
    UPDATE_NOTEBOOK(state, id: string) {
        const n = findNotebookRecursive(state.globalNavigation.notebooks.entries, id);
        console.log('update!', id);
        state.globalNavigation.notebooks.input = { mode: 'update', ...n };
    },
    UPDATE_NOTEBOOK_CONFIRM(state) {
        const input = state.globalNavigation.notebooks.input;

        if (input.value == null) {
            throw new Error('No notebook value passed');
        }

        const n = findNotebookRecursive(
            state.globalNavigation.notebooks.entries,
            state.globalNavigation.notebooks.input.id!
        )!;

        n.value = input.value!;
        state.globalNavigation.notebooks.input = {};
    },
    UPDATE_NOTEBOOK_CANCEL(state) {
        state.globalNavigation.notebooks.input = {};
    },
    SORT_NOTEBOOKS(state) {
        recursiveSort(state.globalNavigation.notebooks.entries);

        function recursiveSort(notebooks: Notebook[]) {
            for (let i = 0; i < notebooks.length; i++) {
                const n = notebooks[i];

                if (n.children != null) {
                    n.children.sort((a, b) => a.value.toUpperCase().localeCompare(b.value.toUpperCase()));
                    recursiveSort(n.children);
                }
            }
        }
    },
    DELETE_NOTEBOOK(state, id) {
        const index = state.globalNavigation.notebooks.entries.findIndex((t) => t.id === id);

        if (index === -1) {
            throw new Error('No notebook found');
        }

        state.globalNavigation.notebooks.entries.splice(index, 1);
    },
    DRAG_NOTEBOOK_START(state, dragging: { start: Notebook; parent: Notebook }) {
        console.log('drag start: ', state.globalNavigation.notebooks.dragging);
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
        if (dragging.start.id !== endedOnId && findNotebookRecursive(dragging.start.children!, endedOnId!) == null) {
            // Remove from old parent if needed
            if (dragging.parent != null) {
                const oldIndex = dragging.parent.children!.findIndex((c) => c.id === dragging.start.id);
                dragging.parent.children!.splice(oldIndex, 1);

                if (dragging.parent.children?.length === 0) {
                    dragging.parent.expanded = false;
                }
            }
            // No parent, we gotta remove it from the root array
            else {
                const oldIndex = state.globalNavigation.notebooks.entries.findIndex((n) => n.id === dragging.start.id);
                state.globalNavigation.notebooks.entries.splice(oldIndex, 1);
            }

            // Didn't end on a notebook. Assume it should be placed in root.
            if (endedOnId == null) {
                state.globalNavigation.notebooks.entries.push(dragging.start);
            } else {
                const endedOn = findNotebookRecursive(state.globalNavigation.notebooks.entries, endedOnId)!;

                if (endedOn.children == null) {
                    endedOn.children = [];
                }

                endedOn.children.push(dragging.start);
            }
        }

        state.globalNavigation.notebooks.dragging = undefined;
    }
};
