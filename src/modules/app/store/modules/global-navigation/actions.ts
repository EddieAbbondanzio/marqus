import { getEntity } from '@/core/store/entity';
import { Notebook } from '@/modules/notebooks/common/notebook';
import { findNotebookRecursive } from '@/modules/notebooks/store/mutations';
import { Tag } from '@/modules/tags/common/tag';
import { State } from '@/store/state';
import { confirmDelete } from '@/utils/prompts/confirm-delete';
import { confirmReplaceNotebook } from '@/utils/prompts/confirm-replace-notebook';
import { Action, ActionContext, ActionTree } from 'vuex';
import { GlobalNavigation, GlobalNavigationEvent, GlobalNavigationEventType } from './state';

export const actions: ActionTree<GlobalNavigation, State> = {
    setActive({ commit, state }, a: { id: string; type: 'notebook' | 'tag' }) {
        const event: GlobalNavigationEvent = {
            type: 'activeChanged',
            newValue: a,
            oldValue: state.active
        };

        commit('APPLY', event);
    },
    tagInputStart({ commit, rootState, state }, { id }: { id?: string } = {}) {
        let tag: Tag | undefined;

        if (id != null) {
            tag = rootState.tags.values.find((t) => t.id === id);

            if (tag == null) {
                throw new Error(`No tag with id ${id} found.`);
            }
        }

        const inputEvent: GlobalNavigationEvent = {
            type: 'tagInputStarted',
            tag: tag
        };

        commit('APPLY', inputEvent);

        const expandedEvent: GlobalNavigationEvent = {
            type: 'tagsExpanded',
            newValue: true,
            oldValue: state.tags.expanded
        };

        commit('APPLY', expandedEvent);
    },
    tagInputConfirm({ commit, state }) {
        const tag = Object.assign({} as Tag, state.tags.input);

        switch (state.tags.input.mode) {
            case 'create':
                commit('tags/CREATE', tag, { root: true });
                break;

            case 'update':
                commit('tags/UPDATE', tag, { root: true });
                break;

            default:
                throw Error(`Invalid tag input mode: ${state.tags.input.mode}`);
        }

        commit('tags/SORT', null, { root: true });

        const clearEvent: GlobalNavigationEvent = {
            type: 'tagInputCleared',
            oldValue: state.tags.input
        };

        commit('APPLY', clearEvent);
    },
    tagInputCancel({ commit, state }) {
        const clearEvent: GlobalNavigationEvent = {
            type: 'tagInputCleared',
            oldValue: state.tags.input
        };

        commit('APPLY', clearEvent);
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

        const inputEvent: GlobalNavigationEvent = {
            type: 'notebookInputStarted',
            notebook,
            parent
        };

        commit('APPLY', inputEvent);

        commit('APPLY', {
            type: 'notebooksExpanded',
            newValue: true,
            oldValue: state.notebooks.expanded
        } as GlobalNavigationEvent);

        if (parent != null) {
            commit('notebooks/EXPANDED', { notebook: parent, bubbleUp: true }, { root: true });
        }
    },
    notebookInputConfirm({ commit, state }) {
        const notebook = Object.assign({} as Notebook, state.notebooks.input);

        switch (state.notebooks.input.mode) {
            case 'create':
                commit('notebooks/CREATE', notebook, { root: true });
                break;

            case 'update':
                commit('notebooks/UPDATE', notebook, { root: true });
                break;

            default:
                throw new Error(`Invalid notebook input mode ${state.notebooks.input.mode}`);
        }

        commit('APPLY', {
            type: 'notebookInputCleared',
            oldValue: state.notebooks.input
        } as GlobalNavigationEvent);

        commit('notebooks/SORT', null, { root: true });
    },
    notebookInputCancel({ commit, state }) {
        commit('APPLY', {
            type: 'notebookInputCleared',
            oldValue: state.notebooks.input
        } as GlobalNavigationEvent);
    },
    async notebookDelete({ commit, rootState }, id: string) {
        const notebook = findNotebookRecursive(rootState.notebooks.values, id)!;

        if (await confirmDelete('notebook', notebook.value)) {
            commit('notebooks/DELETE', id, { root: true });
            commit('notes/REMOVE_NOTEBOOK', { notebookId: id }, { root: true });
        }
    },
    notebookDragStart({ commit }, notebook: Notebook) {
        const event: GlobalNavigationEvent = {
            type: 'notebookDraggingUpdated',
            newValue: notebook,
            oldValue: undefined
        };

        commit('APPLY', event);
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

            const event: GlobalNavigationEvent = {
                type: 'notebookDraggingUpdated',
                oldValue: state.notebooks.dragging,
                newValue: undefined
            };

            commit('APPLY', event);

            commit('notebooks/SORT', null, { root: true });
        }
    },
    notebookDragCancel({ commit, state }) {
        const dragging: GlobalNavigationEvent = {
            type: 'notebookDraggingUpdated',
            oldValue: state.notebooks.dragging,
            newValue: undefined
        };

        commit('APPLY', dragging);
    },
    expandAll({ commit, state }) {
        const tagsExpanded: GlobalNavigationEvent = {
            type: 'tagsExpanded',
            newValue: true,
            oldValue: state.tags.expanded
        };

        commit('APPLY', tagsExpanded);

        const notebooksExpanded: GlobalNavigationEvent = {
            type: 'notebooksExpanded',
            newValue: true,
            oldValue: state.notebooks.expanded
        };

        commit('APPLY', notebooksExpanded);

        commit('notebooks/ALL_EXPANDED', true, { root: true });
    },
    collapseAll({ commit, state }) {
        const tagsExpanded: GlobalNavigationEvent = {
            type: 'tagsExpanded',
            newValue: false,
            oldValue: state.tags.expanded
        };

        commit('APPLY', tagsExpanded);

        const notebooksExpanded: GlobalNavigationEvent = {
            type: 'notebooksExpanded',
            newValue: false,
            oldValue: state.notebooks.expanded
        };

        commit('APPLY', notebooksExpanded);

        commit('notebooks/ALL_EXPANDED', false, { root: true });
    },
    async emptyTrash({ commit }) {
        if (await confirmDelete('the trash', 'permanently')) {
            commit('notes/EMPTY_TRASH', null!, { root: true });
        }
    }
};
