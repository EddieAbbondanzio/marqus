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
import { UndoGrouper } from '@/store/plugins/undo';
import { NotebookCreate } from '@/features/notebooks/store/mutations';

export class GlobalNavigationActions extends Actions<
    GlobalNavigationState,
    GlobalNavigationGetters,
    GlobalNavigationMutations,
    GlobalNavigationActions
> {
    tags!: Context<typeof tags>;
    notebooks!: Context<typeof notebooks>;
    notes!: Context<typeof notes>;

    group!: UndoGrouper;

    async $init(store: Store<any>) {
        this.tags = tags.context(store);
        this.notebooks = notebooks.context(store);
        this.notes = notes.context(store);

        this.group = undo.generateGrouper('globalNavigation');
    }

    setActive(a: GlobalNavigationActive) {
        this.commit('SET_ACTIVE', { value: a });
    }

    setWidth(width: string) {
        this.commit('SET_WIDTH', { value: width });
    }

    tagInputStart({ id }: { id?: string } = {}) {
        const _undo = { ignore: true };

        this.commit('SET_TAGS_EXPANDED', { value: true, _undo });

        if (id != null) {
            const tag = this.tags.getters.byId(id);

            if (tag == null) {
                throw new Error(`No tag with id ${id} found.`);
            }

            this.commit('START_TAGS_INPUT', { value: { id: tag?.id, value: tag?.value }, _undo });
        } else {
            this.commit('START_TAGS_INPUT', { value: undefined, _undo });
        }
    }

    tagInputUpdated(value: string) {
        this.commit('SET_TAGS_INPUT', { value, _undo: { ignore: true } });
    }

    tagInputConfirm() {
        this.group((_undo) => {
            const input = this.state.tags.input;
            let existing: Tag;

            switch (input?.mode) {
                case 'create':
                    this.tags.commit('CREATE', {
                        value: { id: generateId(), value: input.value },
                        _undo: {
                            ..._undo,
                            undoCallback: (m) => {
                                this.tags.commit('DELETE', { value: { id: m.payload.value.id } });
                                this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
                            },
                            redoCallback: (m) => {
                                this.tags.commit('CREATE', m.payload);
                                this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
                            }
                        }
                    });
                    break;

                case 'update':
                    existing = this.tags.getters.byId(input.id)!;

                    this.tags.commit('SET_NAME', {
                        value: { tag: existing, newName: input.value },
                        _undo: {
                            ..._undo,
                            cache: { oldName: existing.value },
                            // We have to trigger callbacks on modules that aren't tracked by undo.
                            undoCallback: (m) =>
                                this.tags.commit('SET_NAME', {
                                    value: { tag: m.payload.value.tag, newName: m.payload._undo.cache.oldName }
                                }),
                            redoCallback: (m) => {
                                this.tags.commit('SET_NAME', {
                                    value: { tag: m.payload.value.tag, newName: m.payload.value.newName }
                                });
                            }
                        }
                    });
                    break;
            }

            // We don't want to allow the user to undo these
            _undo.ignore = true;
            this.tags.commit('SORT', { _undo });
            this.commit('CLEAR_TAGS_INPUT', { _undo });
        });
    }

    tagInputCancel() {
        this.commit('CLEAR_TAGS_INPUT', { _undo: { ignore: true } });
    }

    async tagDelete(id: string) {
        await this.group(async (_undo) => {
            const tag = this.tags.getters.byId(id);

            if (tag == null) {
                throw new Error(`No tag with id ${id} found.`);
            }

            const confirm = await confirmDelete('tag', tag.value);

            if (confirm) {
                _undo.cache = { id, value: tag.value };

                this.tags.commit('DELETE', {
                    value: { id },
                    _undo: {
                        ..._undo,
                        undoCallback: (m) => {
                            this.tags.commit('CREATE', {
                                value: { id: m.payload._undo.cache.id, value: m.payload._undo.cache.value }
                            });

                            this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
                        },
                        redoCallback: (m) =>
                            this.tags.commit('DELETE', {
                                value: { id }
                            })
                    }
                });

                // Find out what notebooks had the tag so we can cache it.
                const notebooksWithTag = this.notes.getters.notesByTag(id);
                _undo.cache.notebookIds = notebooksWithTag.map((n) => n.id);

                this.notes.commit('REMOVE_TAG', {
                    value: { tagId: id },
                    _undo: {
                        ..._undo,
                        undoCallback: (m) =>
                            this.notes.commit('ADD_TAG', {
                                value: { noteId: m.payload._undo.cache.notebookIds, tagId: m.payload.value.tagId }
                            }),
                        redoCallback: (m) => this.notes.commit('REMOVE_TAG', { value: m.payload.value })
                    }
                });
            }
        });
    }

    setTagsExpanded(expanded: boolean) {
        this.commit('SET_TAGS_EXPANDED', { value: expanded, _undo: { ignore: true } });
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
            this.notebooks.commit('SET_EXPANDED', { value: { notebook: parent, bubbleUp: true, expanded: true } });
        }
    }

    notebookInputUpdated(value: string) {
        this.commit('SET_NOTEBOOKS_INPUT', { value });
    }

    notebookInputConfirm() {
        const input = this.state.notebooks.input!;
        let notebook: NotebookCreate;
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

                this.notebooks.commit('CREATE', { value: notebook });
                break;

            case 'update':
                old = this.notebooks.state.values.find((n) => n.id === input.id)!;
                this.notebooks.commit('SET_NAME', { value: { id: old.id, value: input.value } });
                break;

            default:
                throw new Error(`Invalid notebook input mode ${this.state.notebooks.input?.mode}`);
        }

        this.commit('CLEAR_NOTEBOOKS_INPUT');

        this.notebooks.commit('SORT', {});
    }

    notebookInputCancel() {
        this.commit('CLEAR_NOTEBOOKS_INPUT');
    }

    async notebookDelete(id: string) {
        const notebook = findNotebookRecursive(this.notebooks.state.values, id)!;

        if (await confirmDelete('notebook', notebook.value)) {
            this.notebooks.commit('DELETE', { value: { id: id } });
            this.notes.commit('REMOVE_NOTEBOOK', { value: { notebookId: id } });
        }
    }

    setNotebooksExpanded(expanded: boolean) {
        this.commit('SET_NOTEBOOKS_EXPANDED', { value: expanded });
    }

    notebookDragStart(notebook: Notebook) {
        this.commit('SET_NOTEBOOKS_DRAGGING', { value: notebook.id });
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
            this.notebooks.commit('DELETE', { value: { id: dragging.id } });

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
                    this.notebooks.commit('DELETE', { value: { id: duplicate.id } });
                }
            }

            // Insert into new spot
            this.notebooks.commit('CREATE', {
                value: {
                    id: dragging.id,
                    value: dragging.value,
                    parent,
                    children: dragging.children,
                    expanded: dragging.expanded
                }
            });

            if (parent) {
                this.notebooks.commit('SET_EXPANDED', { value: { notebook: parent, expanded: true, bubbleUp: true } });
            }

            this.commit('CLEAR_NOTEBOOKS_DRAGGING', {});

            this.notebooks.commit('SORT', {});
        }
    }

    notebookDragCancel() {
        this.commit('CLEAR_NOTEBOOKS_DRAGGING', {});
    }

    expandAll() {
        this.commit('SET_TAGS_EXPANDED', { value: true });
        this.commit('SET_NOTEBOOKS_EXPANDED', { value: true });

        this.notebooks.commit('SET_ALL_EXPANDED', { value: { expanded: false } });
    }

    collapseAll() {
        this.commit('SET_TAGS_EXPANDED', { value: false });
        this.commit('SET_NOTEBOOKS_EXPANDED', { value: false });

        this.notebooks.commit('SET_ALL_EXPANDED', { value: { expanded: false } });
    }

    async emptyTrash() {
        if (await confirmDelete('the trash', 'permanently')) {
            this.notes.commit('EMPTY_TRASH', {});
        }
    }
}
