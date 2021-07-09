import { generateId } from '@/store';
import { Notebook } from '@/features/notebooks/common/notebook';
import { Tag } from '@/features/tags/common/tag';
import { Action, ActionContext, ActionTree, Store } from 'vuex';
import { GlobalNavigationState, GlobalNavigationActive } from './state';
import { findNotebookRecursive } from '@/features/notebooks/common/find-notebook-recursive';
import { undo } from '@/store/plugins/undo/undo';
import { confirmDelete, confirmReplaceNotebook } from '@/shared/utils';
import { Actions, Context } from 'vuex-smart-module';
import { GlobalNavigationGetters } from '@/features/ui/store/modules/global-navigation/getters';
import { GlobalNavigationMutations } from '@/features/ui/store/modules/global-navigation/mutations';
import { tags } from '@/features/tags/store';
import { notebooks } from '@/features/notebooks/store';
import { notes } from '@/features/notes/store';
import { UndoModule } from '@/store/plugins/undo';

let group: UndoModule['group'];

export class GlobalNavigationActions extends Actions<
    GlobalNavigationState,
    GlobalNavigationGetters,
    GlobalNavigationMutations,
    GlobalNavigationActions
> {
    tags!: Context<typeof tags>;
    notebooks!: Context<typeof notebooks>;
    notes!: Context<typeof notes>;

    $init(store: Store<any>) {
        this.tags = tags.context(store);
        this.notebooks = notebooks.context(store);
        this.notes = notes.context(store);

        const undoModule = undo.getModule('globalNavigation');
        group = undoModule.group.bind(undoModule);
    }

    setActive(a: GlobalNavigationActive) {
        this.commit('SET_ACTIVE', a);
    }

    setWidth(width: string) {
        this.commit('SET_WIDTH', width);
    }

    tagInputStart({ id }: { id?: string } = {}) {
        let tag: Tag | undefined;

        if (id != null) {
            tag = this.tags.state.values.find((t) => t.id === id) as Tag | undefined;

            if (tag == null) {
                throw new Error(`No tag with id ${id} found.`);
            }

            this.commit('START_TAGS_INPUT', { id: tag?.id, value: tag?.value });
        } else {
            this.commit('START_TAGS_INPUT');
        }

        group((undo) => {
            this.commit('SET_TAGS_EXPANDED', { value: true, undo });
        });
    }

    tagInputUpdated(val: string) {
        this.commit('SET_TAGS_INPUT', val);
    }

    tagInputConfirm() {
        const tag = Object.assign({} as Tag, this.state.tags.input);

        switch (this.state.tags.input!.mode) {
            case 'create':
                this.tags.commit('CREATE', { id: tag.id, value: tag.value });
                break;

            case 'update':
                this.tags.commit('SET_NAME', { id: tag.id, value: tag.value });
                break;

            default:
                throw Error(`Invalid tag input mode: ${this.state.tags.input!.mode}`);
        }

        this.tags.commit('SORT');
        this.commit('CLEAR_TAGS_INPUT');
    }

    tagInputCancel() {
        this.commit('CLEAR_TAGS_INPUT');
    }

    async tagDelete(id: string) {
        const tag = this.tags.state.values.find((t) => t.id === id);

        if (tag == null) {
            throw new Error(`No tag with id ${id} found.`);
        }

        const confirm = await confirmDelete('tag', tag.value);

        if (confirm) {
            this.tags.commit('DELETE', { id: id });
            this.notes.commit('REMOVE_TAG', { tagId: id });
        }
    }

    setTagsExpanded(expanded: boolean) {
        this.commit('SET_TAGS_EXPANDED', { value: expanded });
    }

    notebookInputStart({ id, parentId }: { id?: string; parentId?: string } = {}) {
        let notebook: Notebook | undefined;
        let parent: Notebook | undefined;

        /*
         * id != null -> update
         * id == null -> create, check if we put it under root, or a parent (parentId != null)
         */

        if (id != null) {
            notebook = findNotebookRecursive(this.notebooks.state.values, id);

            if (notebook == null) {
                throw new Error(`No notebook with id ${id} found.`);
            }
        }

        if (id == null && parentId != null) {
            parent = findNotebookRecursive(this.notebooks.state.values, parentId);
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

        this.commit('START_NOTEBOOKS_INPUT', p);

        if (parent != null) {
            this.notebooks.commit('SET_EXPANDED', { notebook: parent, bubbleUp: true, expanded: true });
        }
    }

    notebookInputUpdated(val: string) {
        this.commit('SET_NOTEBOOKS_INPUT', val);
    }

    notebookInputConfirm() {
        const input = this.state.notebooks.input!;
        let notebook: Notebook;
        let old: Notebook | undefined;

        switch (this.state.notebooks.input?.mode) {
            case 'create':
                notebook = {
                    id: generateId(),
                    value: input.value,
                    expanded: false
                };

                if (input.parentId != null) {
                    notebook.parent = findNotebookRecursive(this.notebooks.state.values, input.parentId)!;
                }

                this.notebooks.commit('CREATE', notebook);
                break;

            case 'update':
                old = this.notebooks.state.values.find((n) => n.id === input.id)!;
                this.notebooks.commit('SET_NAME', { id: old.id, value: input.value });
                break;

            default:
                throw new Error(`Invalid notebook input mode ${this.state.notebooks.input?.mode}`);
        }

        this.commit('CLEAR_NOTEBOOKS_INPUT');

        this.notebooks.commit('SORT', null);
    }

    notebookInputCancel() {
        this.commit('CLEAR_NOTEBOOKS_INPUT');
    }

    async notebookDelete(id: string) {
        const notebook = findNotebookRecursive(this.notebooks.state.values, id)!;

        if (await confirmDelete('notebook', notebook.value)) {
            this.notebooks.commit('DELETE', { id: id });
            this.notes.commit('REMOVE_NOTEBOOK', { notebookId: id });
        }
    }

    setNotebooksExpanded(expanded: boolean) {
        this.commit('SET_NOTEBOOKS_EXPANDED', { value: expanded });
    }

    notebookDragStart(notebook: Notebook) {
        this.commit('SET_NOTEBOOKS_DRAGGING', notebook.id);
    }

    async notebookDragStop(endedOnId: string | null) {
        const dragging: Notebook = findNotebookRecursive(this.notebooks.state.values, this.state.notebooks.dragging!)!;

        if (dragging == null) {
            throw new Error('No drag to finalize.');
        }

        /*
         * Don't allow a move if we started and stopped on the same element, or if
         * we are attempting to move a parent to a child of it.
         */
        if (dragging.id !== endedOnId && findNotebookRecursive(dragging.children!, endedOnId!) == null) {
            // Remove from old location
            this.notebooks.commit('DELETE', { id: dragging.id });

            let parent: Notebook | undefined;

            if (endedOnId != null) {
                parent = findNotebookRecursive(this.notebooks.state.values, endedOnId);
            }

            /*
             * Check for a notebook with the same name in the new destination. If one exists,
             * we'll need to verify with the user that they want to replace it.
             */
            const newSiblings =
                endedOnId == null
                    ? this.notebooks.state.values
                    : findNotebookRecursive(this.notebooks.state.values, endedOnId)?.children ?? [];

            const duplicate = newSiblings.find((n) => n.value === dragging.value)!;
            if (duplicate != null) {
                const confirmReplace = await confirmReplaceNotebook(dragging.value);

                if (confirmReplace) {
                    this.notebooks.commit('DELETE', { id: duplicate.id });
                }
            }

            // Insert into new spot
            this.notebooks.commit(
                'CREATE',
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
                this.notebooks.commit(
                    'SET_EXPANDED',
                    { notebook: parent, expanded: true, bubbleUp: true },
                    { root: true }
                );
            }

            this.commit('SET_NOTEBOOKS_DRAGGING');

            this.notebooks.commit('SORT', null);
        }
    }

    notebookDragCancel() {
        this.commit('SET_NOTEBOOKS_DRAGGING');
    }

    expandAll() {
        this.commit('SET_TAGS_EXPANDED', { value: true });
        this.commit('SET_NOTEBOOKS_EXPANDED', { value: true });

        this.notebooks.commit('SET_ALL_EXPANDED', false);
    }

    collapseAll() {
        this.commit('SET_TAGS_EXPANDED', { value: false });
        this.commit('SET_NOTEBOOKS_EXPANDED', { value: false });

        this.notebooks.commit('SET_ALL_EXPANDED', false);
    }

    async emptyTrash() {
        if (await confirmDelete('the trash', 'permanently')) {
            this.notes.commit('EMPTY_TRASH');
        }
    }
}
