import { MutationTree } from 'vuex';
import { GlobalNavigation } from '@/store/modules/app/modules/global-navigation/state';
import { Notebook, NotebookState } from '@/store/modules/notebooks/state';
import { id as generateId } from '@/utils/id';
import { Tag } from '@/store/modules/tags/state';
import { findNotebookRecursive } from '@/store/modules/notebooks/mutations';

export const mutations: MutationTree<GlobalNavigation> = {
    ACTIVE(s, id) {
        s.active = id;
    },
    WIDTH(s, width) {
        s.width = width;
    },
    TAGS_EXPANDED(s, e = true) {
        s.tags.expanded = e;
    },
    TAG_INPUT_VALUE(s, value: string) {
        s.tags.input.value = value;
    },
    TAG_INPUT_START(s, tag: Tag | null = null) {
        // Create
        if (tag == null) {
            s.tags.input = {
                id: generateId(),
                mode: 'create'
            };
        }
        // Update
        else {
            s.tags.input = {
                id: tag.id,
                value: tag.value,
                mode: 'update'
            };
        }
    },
    TAG_INPUT_CLEAR(s) {
        s.tags.input = {};
    },
    NOTEBOOKS_EXPANDED(s, e = true) {
        s.notebooks.expanded = e;
    },
    NOTEBOOK_EXPANDED(
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
    NOTEBOOK_INPUT_START(s, { notebook, parent }: { notebook?: Notebook; parent?: Notebook }) {
        // Update
        if (notebook != null) {
            s.notebooks.input = {
                id: notebook.id,
                value: notebook.value,
                mode: 'update',
                parent
            };
        }
        // Create
        else {
            s.notebooks.input = {
                id: generateId(),
                mode: 'create',
                parent
            };
        }
    },
    NOTEBOOK_INPUT_CLEAR(s) {
        s.notebooks.input = {};
    },
    NOTEBOOK_INPUT_VALUE(s, value: string) {
        s.notebooks.input.value = value;
    },
    NOTEBOOK_DRAGGING(state, dragging: Notebook) {
        state.notebooks.dragging = dragging;
    },
    NOTEBOOK_DRAGGING_CLEAR(state) {
        delete state.notebooks.dragging;
    }
};
