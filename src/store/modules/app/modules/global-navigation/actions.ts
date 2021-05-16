import { findNotebookRecursive } from '@/store/modules/notebooks/mutations';
import { Notebook } from '@/store/modules/notebooks/state';
import { Tag } from '@/store/modules/tags/state';
import { State } from '@/store/state';
import { confirmDelete } from '@/utils/prompts/confirm-delete';
import { confirmReplaceNotebook } from '@/utils/prompts/confirm-replace-notebook';
import { Action, ActionContext, ActionTree } from 'vuex';
import { GlobalNavigation } from './state';

export const actions: ActionTree<GlobalNavigation, State> = {
    setActive({ commit }, a: { id: string; type: 'notebook' | 'tag' }) {
        commit('ACTIVE', a);
        commit('app/localNavigation/ACTIVE', null, { root: true });
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
            commit('notes/REMOVE_TAG', { tagId: id }, { root: true });
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
            commit('notebooks/EXPANDED', { notebook: parent, bubbleUp: true }, { root: true });
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
    },
    notebookInputCancel({ commit }) {
        commit('NOTEBOOK_INPUT_CLEAR');
    },
    async notebookDelete({ commit, rootState }, id: string) {
        const notebook = findNotebookRecursive(rootState.notebooks.values, id)!;

        if (await confirmDelete('notebook', notebook.value)) {
            commit('notebooks/DELETE', id, { root: true });
            commit('notes/REMOVE_NOTEBOOK', { notebookId: id }, { root: true });
        }
    },
    notebookDragStart({ commit }, notebook: Notebook) {
        commit('NOTEBOOK_DRAGGING', notebook);
        commit('app/CURSOR_TITLE', notebook.value, { root: true });
    },
    async notebookDragStop({ commit, rootState, state }, endedOnId: string | null) {
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

            /*
             * Check for a notebook with the same name in the new destination. If one exists,
             * we'll need to verify with the user that they want to replace it.
             */
            const newSiblings =
                endedOnId == null
                    ? rootState.notebooks.values
                    : findNotebookRecursive(rootState.notebooks.values, endedOnId)?.children ?? [];

            const duplicate = newSiblings.find((n) => n.value === dragging.value);
            if (duplicate != null) {
                const confirmReplace = await confirmReplaceNotebook(dragging.value);

                if (confirmReplace) {
                    commit('notebooks/DELETE', duplicate.id, { root: true });
                }
            }

            // Insert into new spot
            commit(
                'notebooks/CREATE',
                {
                    id: dragging.id,
                    value: dragging.value,
                    parent,
                    children: dragging.children,
                    expanded: dragging.expanded
                },
                { root: true }
            );

            if (parent) {
                commit('notebooks/EXPANDED', { notebook: parent, expanded: true, bubbleUp: true }, { root: true });
            }

            commit('NOTEBOOK_DRAGGING_CLEAR');
            commit('notebooks/SORT', null, { root: true });
        }

        commit('app/CURSOR_TITLE_CLEAR', null, { root: true });
    },
    noteDragCancel({ commit }) {
        commit('NOTEBOOK_DRAGGING_CLEAR');
        commit('app/CURSOR_TITLE_CLEAR', null, { root: true });
    },
    expandAll({ commit }) {
        commit('TAGS_EXPANDED', true);
        commit('NOTEBOOKS_EXPANDED', true);
        commit('notebooks/ALL_EXPANDED', true, { root: true });
    },
    collapseAll({ commit }) {
        commit('TAGS_EXPANDED', false);
        commit('NOTEBOOKS_EXPANDED', false);
        commit('notebooks/ALL_EXPANDED', false, { root: true });
    },
    async emptyTrash({ commit }) {
        if (await confirmDelete('the trash', 'permanently')) {
            commit('notes/EMPTY_TRASH', null!, { root: true });
        }
    }
};
