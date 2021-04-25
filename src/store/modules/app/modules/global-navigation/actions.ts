import { findNotebookRecursive } from '@/store/modules/notebooks/mutations';
import { Notebook } from '@/store/modules/notebooks/state';
import { Tag } from '@/store/modules/tags/state';
import { State } from '@/store/state';
import { confirmDelete } from '@/utils/confirm-delete';
import { Action, ActionContext, ActionTree } from 'vuex';
import { GlobalNavigation } from './state';

export const actions: ActionTree<GlobalNavigation, State> = {
    setActive({ commit }, a: { id: string; type: 'notebook' | 'tag' }) {
        commit('ACTIVE', a);
        commit('DIRTY', null, { root: true });
    },
    tagInputStart({ commit, rootState }, id: string | null = null) {
        let tag: Tag | undefined;

        if (id != null) {
            tag = rootState.tags.values.find((t) => t.id === id);

            if (tag == null) {
                throw new Error(`No tag with id ${id} found.`);
            }
        }

        commit('TAG_INPUT_START', tag);
        commit('TAGS_EXPANDED');
    },
    tagInputConfirm({ commit, state }) {
        const input = state.tags.input;

        const tag = {
            id: input.id,
            value: input.value
        };

        switch (input.mode) {
            case 'create':
                commit('tags/CREATE', tag, { root: true });
                break;

            case 'update':
                commit('tags/UPDATE', tag, { root: true });
                break;

            default:
                throw Error(`Invalid tag input mode: ${state.tags.input.mode}`);
        }

        commit('TAG_INPUT_CLEAR');
        commit('tags/SORT', null, { root: true });
        commit('DIRTY', null, { root: true });
    },
    tagInputCancel({ commit }) {
        commit('TAG_INPUT_CLEAR');
    },
    async tagDelete({ commit, rootState }, id: string) {
        const tag = rootState.tags.values.find((t) => t.id === id);

        if (tag == null) {
            throw new Error(`No tag with id ${id} found.`);
        }

        const confirm = await confirmDelete('tag', tag.value);

        if (confirm) {
            commit('tags/DELETE', id, { root: true });
            commit('DIRTY', null, { root: true });
        }
    },
    notebookInputStart({ commit, rootState }, { id, parentId }: { id?: string; parentId?: string } = {}) {
        let notebook: Notebook | undefined;
        let parent: Notebook | undefined;

        /*
         * id != null -> update
         * id == null -> create, check if we put it under root, or a parent (parentId != null)
         */

        if (id != null) {
            notebook = findNotebookRecursive(rootState.notebooks.values, id);

            if (notebook == null) {
                throw new Error(`No notebook with id ${id} found.`);
            }
        }

        if (id == null && parentId != null) {
            parent = findNotebookRecursive(rootState.notebooks.values, parentId);
        }

        commit('NOTEBOOK_INPUT_START', { notebook, parent });
        commit('NOTEBOOKS_EXPANDED');

        if (parent != null) {
            commit('NOTEBOOK_EXPANDED', { notebook: parent, bubbleUp: true });
        }
    },
    notebookInputConfirm({ commit, state }) {
        const input = state.notebooks.input;

        const notebook = {
            id: input.id!,
            value: input.value!,
            parent: input.parent!
        };

        switch (input.mode) {
            case 'create':
                commit('notebooks/CREATE', notebook, { root: true });
                break;

            case 'update':
                commit('notebooks/UPDATE', notebook, { root: true });
                break;

            default:
                throw new Error(`Invalid notebook input mode ${input.mode}`);
        }

        commit('NOTEBOOK_INPUT_CLEAR');
        commit('notebooks/SORT', null, { root: true });
        commit('DIRTY', null, { root: true });
    },
    notebookInputCancel({ commit }) {
        commit('NOTEBOOK_INPUT_CLEAR');
    },
    async notebookDelete({ commit, rootState }, id: string) {
        const notebook = findNotebookRecursive(rootState.notebooks.values, id)!;

        if (await confirmDelete('tag', notebook.value)) {
            commit('notebooks/DELETE', id, { root: true });
            commit('DIRTY', null, { root: true });
        }
    },
    notebookDragStart({ commit }, notebook: Notebook) {
        commit('NOTEBOOK_DRAGGING', notebook);
        commit('app/CURSOR_TITLE', notebook.value, { root: true });
    },
    notebookDragStop({ commit, rootState, state }, endedOnId: string | null) {
        const dragging = state.notebooks.dragging;

        if (dragging == null) {
            throw new Error('No drag to finalize.');
        }

        /*
         * Don't allow a move if we started and stopped on the same element, or if
         * we are attempting to move a parent to a child of it.
         */
        if (dragging.id !== endedOnId && findNotebookRecursive(dragging.children!, endedOnId!) == null) {
            // Remove from old location
            commit('notebooks/DELETE', dragging.id, { root: true });

            let parent: Notebook | undefined;

            if (endedOnId != null) {
                parent = findNotebookRecursive(rootState.notebooks.values, endedOnId);
            }

            // Insert into new spot
            commit('notebooks/CREATE', { id: dragging.id, value: dragging.value, parent }, { root: true });

            if (parent) {
                commit('NOTEBOOK_EXPANDED', { notebook: parent, expanded: true, bubbleUp: true });
            }

            commit('NOTEBOOK_DRAGGING_CLEAR');
            commit('notebooks/SORT', null, { root: true });
            commit('DIRTY', null, { root: true });
        }

        commit('app/CURSOR_TITLE_CLEAR', null, { root: true });
    }
};
