import { MutationTree } from 'vuex';
import { GlobalNavigation } from '@/store/modules/app/modules/global-navigation/state';
import { Notebook, NotebookState } from '@/store/modules/notebooks/state';
import { generateId } from '@/store/core/entity';
import { Tag } from '@/store/modules/tags/state';
import { findNotebookRecursive } from '@/store/modules/notebooks/mutations';

export const mutations: MutationTree<GlobalNavigation> = {
    ACTIVE(s, a: 'all' | 'favorites' | 'trash' | { id: string; type: 'notebook' | 'tag' }) {
        s.active = a;
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
    }
};
