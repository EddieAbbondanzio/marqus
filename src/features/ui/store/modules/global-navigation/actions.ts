import { generateId } from '@/store';
import { Notebook } from '@/features/notebooks/common/notebook';
import { findNotebookRecursive } from '@/features/notebooks/store/mutations';
import { Tag } from '@/features/tags/common/tag';
import { State } from '@/store/state';
import { confirmDelete } from '@/utils/prompts/confirm-delete';
import { confirmReplaceNotebook } from '@/utils/prompts/confirm-replace-notebook';
import { Action, ActionContext, ActionTree } from 'vuex';
import { GlobalNavigation } from './state';

export const actions: ActionTree<GlobalNavigation, State> = {
    setActive({ commit }, a: { id: string; type: 'notebook' | 'tag' }) {
        commit('ACTIVE_UPDATED', a);
    },
    setWidth({ commit, state }, width: string) {
        commit('WIDTH_UPDATED', width);
    },
    tagInputStart({ commit, rootState, state }, { id }: { id?: string } = {}) {
        let tag: Tag | undefined;

        if (id != null) {
            tag = rootState.tags.values.find((t) => t.id === id);

            if (tag == null) {
                throw new Error(`No tag with id ${id} found.`);
            }
        }

        commit('TAG_INPUT_STARTED', { id: tag!.id, value: tag!.value });
        commit('TAGS_EXPANDED_UPDATED', true);
    },
    tagInputUpdated({ commit, state }, val: string) {
        commit('TAGS_INPUT_UPDATED', val);
    },
    tagInputConfirm({ commit, state }) {
        const tag = Object.assign({} as Tag, state.tags.input);

        switch (state.tags.input!.mode) {
            case 'create':
                commit('tags/CREATE', tag, { root: true });
                break;

            case 'update':
                commit('tags/UPDATE', tag, { root: true });
                break;

            default:
                throw Error(`Invalid tag input mode: ${state.tags.input!.mode}`);
        }

        commit('tags/SORT', null, { root: true });
        commit('TAGS_INPUT_CLEARED');
    },
    tagInputCancel({ commit, state }) {
        commit('TAGS_INPUT_CLEARED');
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
    setTagsExpanded({ commit, state }, expanded: boolean) {
        commit('TAGS_EXPANDED_UPDATED', expanded);
    },
    notebookInputStart({ commit, rootState, state }, { id, parentId }: { id?: string; parentId?: string } = {}) {
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

        const p: any = {
            type: 'notebookInputStarted',
            parentId: parent?.id
        };

        if (notebook != null) {
            p.notebook = {
                id: notebook.id,
                value: notebook.value
            };
        }

        commit('NOTEBOOKS_INPUT_STARTED', p);

        if (parent != null) {
            commit('notebooks/EXPANDED', { notebook: parent, bubbleUp: true }, { root: true });
        }
    },
    notebookInputUpdated({ commit, state }, val: string) {
        commit('NOTEBOOKS_INPUT_UPDATED', val);
    },
    notebookInputConfirm({ commit, state, rootState }) {
        const input = state.notebooks.input!;
        let notebook: Notebook;
        let old: Notebook | undefined;

        switch (state.notebooks.input?.mode) {
            case 'create':
                notebook = {
                    id: generateId(),
                    value: input.value,
                    expanded: false
                };

                if (input.parentId != null) {
                    notebook.parent = findNotebookRecursive(rootState.notebooks.values, input.parentId)!;
                }

                commit('notebooks/CREATE', notebook, { root: true });
                break;

            case 'update':
                old = rootState.notebooks.values.find((n) => n.id === input.id)!;

                notebook = {
                    id: old.id,
                    value: input.value,
                    expanded: old.expanded,
                    children: old.children,
                    parent: old.parent
                };

                commit('notebooks/UPDATE', notebook, { root: true });
                break;

            default:
                throw new Error(`Invalid notebook input mode ${state.notebooks.input?.mode}`);
        }

        commit('NOTEBOOKS_INPUT_CLEARED');

        commit('notebooks/SORT', null, { root: true });
    },
    notebookInputCancel({ commit, state }) {
        commit('NOTEBOOKS_INPUT_CLEARED');
    },
    async notebookDelete({ commit, rootState }, id: string) {
        const notebook = findNotebookRecursive(rootState.notebooks.values, id)!;

        if (await confirmDelete('notebook', notebook.value)) {
            commit('notebooks/DELETE', id, { root: true });
            commit('notes/REMOVE_NOTEBOOK', { notebookId: id }, { root: true });
        }
    },
    setNotebooksExpanded({ commit, state }, expanded: boolean) {
        commit('NOTEBOOKS_EXPANDED_UPDATED', expanded);
    },
    notebookDragStart({ commit }, notebook: Notebook) {
        commit('NOTEBOOKS_DRAGGING_UPDATED', notebook.id);
    },
    async notebookDragStop({ commit, rootState, state }, endedOnId: string | null) {
        const dragging: Notebook = findNotebookRecursive(rootState.notebooks.values, state.notebooks.dragging!)!;

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

            commit('NOTEBOOKS_DRAGGING_UPDATED');

            commit('notebooks/SORT', null, { root: true });
        }
    },
    notebookDragCancel({ commit, state }) {
        commit('NOTEBOOKS_DRAGGING_UPDATED');
    },
    expandAll({ commit, state }) {
        commit('TAGS_EXPANDED_UPDATED', true);
        commit('NOTEBOOKS_EXPANDED_UPDATED', true);
        commit('notebooks/ALL_EXPANDED', true, { root: true });
    },
    collapseAll({ commit, state }) {
        commit('TAGS_EXPANDED_UPDATED', false);
        commit('NOTEBOOKS_EXPANDED_UPDATED', false);
        commit('notebooks/ALL_EXPANDED', false, { root: true });
    },
    async emptyTrash({ commit }) {
        if (await confirmDelete('the trash', 'permanently')) {
            commit('notes/EMPTY_TRASH', null!, { root: true });
        }
    }
};
