import { generateId } from '@/store';
import { Notebook } from '@/features/notebooks/common/notebook';
import { Tag } from '@/features/tags/common/tag';
import { Action, ActionContext, ActionTree, Store } from 'vuex';
import { GlobalNavigationState, GlobalNavigationItem } from './state';
import { findNotebookRecursive } from '@/features/notebooks/common/find-notebook-recursive';
import { undo } from '@/store/plugins/undo/undo';
import { confirmDelete, confirmReplaceNotebook } from '@/shared/utils';
import { Actions, Context } from 'vuex-smart-module';
import { GlobalNavigationGetters } from '@/features/ui/store/modules/global-navigation/getters';
import { GlobalNavigationMutations } from '@/features/ui/store/modules/global-navigation/mutations';
import { tags } from '@/features/tags/store';
import { notebooks } from '@/features/notebooks/store';
import { notes } from '@/features/notes/store';
import { UndoContext } from '@/store/plugins/undo';
import { NotebookCreate } from '@/features/notebooks/store/mutations';
import _ from 'lodash';
import { nextTick } from 'vue';

export class GlobalNavigationActions extends Actions<
    GlobalNavigationState,
    GlobalNavigationGetters,
    GlobalNavigationMutations,
    GlobalNavigationActions
> {
    tags!: Context<typeof tags>;
    notebooks!: Context<typeof notebooks>;
    notes!: Context<typeof notes>;

    undoContext!: UndoContext;

    async $init(store: Store<any>) {
        this.tags = tags.context(store);
        this.notebooks = notebooks.context(store);
        this.notes = notes.context(store);

        this.undoContext = undo.getContext({ name: 'globalNavigation' });
    }

    setActive(a: GlobalNavigationItem) {
        // Stop if we're setting the same item active
        if (_.isEqual(this.state.active, a)) {
            return;
        }

        this.undoContext.group((_undo) => {
            this.commit('SET_ACTIVE', { value: a, _undo });
            this.commit('SET_HIGHLIGHT', { value: a, _undo });
        });
    }

    toggleHighlighted() {
        let notebook;

        switch (this.state.highlight?.section) {
            case 'notebook':
                if (this.state.highlight.id == null) {
                    this.commit('SET_NOTEBOOKS_EXPANDED', { value: !this.state.notebooks.expanded });
                } else {
                    notebook = this.notebooks.getters.byId(this.state.highlight.id)!;

                    if (notebook.children == null || notebook.children.length === 0) {
                        return;
                    }

                    this.notebooks.commit('SET_EXPANDED', {
                        value: { notebook, expanded: !notebook.expanded, bubbleUp: false }
                    });
                }
                break;

            case 'tag':
                if (this.state.highlight.id == null) {
                    this.commit('SET_TAGS_EXPANDED', { value: !this.state.tags.expanded });
                }
                break;
        }
    }

    clearHighlight() {
        this.commit('SET_HIGHLIGHT', { value: undefined! });
    }

    moveHighlightUp() {
        const next = this.getters.previousItem();

        if (!_.isEqual(this.state.highlight, next)) {
            this.commit('SET_HIGHLIGHT', { value: next });
        }
    }

    moveHighlightDown() {
        const next = this.getters.nextItem();

        if (!_.isEqual(this.state.highlight, next)) {
            this.commit('SET_HIGHLIGHT', { value: next });
        }
    }

    setWidth(width: string) {
        this.commit('SET_WIDTH', { value: width, _undo: { ignore: true } });
    }

    setScrollPosition(scrollPos: number) {
        this.commit('SET_SCROLL_POSITION', { value: scrollPos });
    }

    scrollUp(pixels = 30) {
        const value = Math.max(this.state.scrollPosition - pixels, 0);
        this.commit('SET_SCROLL_POSITION', { value });
    }

    scrollDown(pixels = 30) {
        const value = Math.max(this.state.scrollPosition + pixels, 0);
        this.commit('SET_SCROLL_POSITION', { value });
    }

    tagInputStart({ id }: { id?: string } = {}) {
        // Stop if we already have an input in progress.
        if (this.state.tags.input?.mode != null) {
            return;
        }

        this.undoContext.group((_undo) => {
            this.commit('SET_TAGS_EXPANDED', { value: true, _undo });

            if (id != null) {
                const tag = this.tags.getters.byId(id, { required: true });

                this.commit('START_TAGS_INPUT', { value: { id: tag?.id, value: tag?.value }, _undo });
            } else {
                this.commit('START_TAGS_INPUT', { value: undefined, _undo });
            }
        });

        this.undoContext.setCheckpoint();
    }

    tagInputUpdated(value: string) {
        if (value === this.state.tags.input?.value) {
            return;
        }

        this.commit('SET_TAGS_INPUT', { value });
    }

    tagInputConfirm() {
        console.log('tag input confirm called');
        this.undoContext.group((_undo) => {
            const input = this.state.tags.input;
            let existing: Tag;

            switch (input?.mode) {
                case 'create':
                    this.tags.commit('CREATE', {
                        value: { id: generateId(), value: input.value },
                        _undo: {
                            ..._undo,
                            undoCallback: (m) => {
                                this.tags.commit('DELETE', { value: m.payload.value.id });
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
                    existing = this.tags.getters.byId(input.id, { required: true });

                    this.tags.commit('SET_NAME', {
                        value: { tag: existing, newName: input.value },
                        _undo: {
                            ..._undo,
                            cache: { oldName: existing.value },
                            // We have to trigger callbacks on modules that aren't tracked by undo.
                            undoCallback: (m) => {
                                this.tags.commit('SET_NAME', {
                                    value: { tag: m.payload.value.tag, newName: m.payload._undo.cache.oldName }
                                });
                                this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
                            },
                            redoCallback: (m) => {
                                this.tags.commit('SET_NAME', {
                                    value: { tag: m.payload.value.tag, newName: m.payload.value.newName }
                                });
                                this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
                            }
                        }
                    });
                    break;
            }

            this.tags.commit('SORT', { _undo });
            this.commit('CLEAR_TAGS_INPUT', { _undo });
        });

        this.undoContext.releaseCheckpoint();
    }

    tagInputCancel() {
        this.undoContext.rollbackToCheckpoint();
        this.commit('CLEAR_TAGS_INPUT', { _undo: { ignore: true } });
    }

    async tagDelete(id: string) {
        const tag = this.tags.getters.byId(id, { required: true });

        if (await confirmDelete('tag', tag.value)) {
            await this.undoContext.group(async (_undo) => {
                _undo.cache = { id, value: tag.value };

                this.tags.commit('DELETE', {
                    value: id,
                    _undo: {
                        ..._undo,
                        undoCallback: (m) => {
                            this.tags.commit('CREATE', {
                                value: { id: m.payload._undo.cache.id, value: m.payload._undo.cache.value }
                            });

                            this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
                        },
                        redoCallback: (m) => {
                            this.tags.commit('DELETE', {
                                value: m.payload._undo.cache.id
                            });
                            this.commit('SET_TAGS_EXPANDED', { value: true, _undo: { ignore: true } });
                        }
                    }
                });

                // Find out what notes had the tag so we can cache it.
                const notesWithTag = this.notes.getters.notesByTag(id);
                _undo.cache.noteIds = notesWithTag.map((n) => n.id);

                this.notes.commit('REMOVE_TAG', {
                    value: { tagId: id },
                    _undo: {
                        ..._undo,
                        undoCallback: (m) =>
                            this.notes.commit('ADD_TAG', {
                                value: { noteId: m.payload._undo.cache.noteIds, tagId: m.payload.value.tagId },
                                _undo: { ignore: true }
                            }),
                        redoCallback: (m) =>
                            this.notes.commit('REMOVE_TAG', { value: m.payload.value, _undo: { ignore: true } })
                    }
                });
            });
        }
    }

    async tagDeleteAll() {
        if (await confirmDelete('every tag', '')) {
            await this.undoContext.group((_undo) => {
                // Cache off tags
                _undo.cache.tags = [];
                for (const tag of this.tags.state.values) {
                    _undo.cache.tags.push({
                        id: tag.id,
                        value: tag.value,
                        noteIds: this.notes.getters.notesByTag(tag.id).map((n) => n.id)
                    });
                }

                this.tags.commit('DELETE_ALL', {
                    _undo: {
                        ..._undo,
                        undoCallback: (m) => {
                            for (const tag of _undo.cache.tags) {
                                this.tags.commit('CREATE', {
                                    value: { id: tag.id, value: tag.value },
                                    _undo: { ignore: true }
                                });

                                this.notes.commit('ADD_TAG', {
                                    value: { noteId: tag.noteIds, tagId: tag.id },
                                    _undo: { ignore: true }
                                });
                            }
                        },
                        redoCallback: (m) => {
                            this.tags.commit('DELETE_ALL', { _undo: { ignore: true } });
                        }
                    }
                });
            });
        }
    }

    setTagsExpanded(expanded: boolean) {
        this.commit('SET_TAGS_EXPANDED', { value: expanded });
    }

    notebookInputStart({ id, parentId }: { id?: string; parentId?: string } = {}) {
        // Stop if we already have an input in progress.
        if (this.state.notebooks.input?.mode != null) {
            return;
        }

        let notebook: Notebook | undefined;
        let parent: Notebook | undefined;

        /*
         * id != null -> update
         * id == null -> create, check if we put it under root, or a parent (parentId != null)
         */

        if (id != null) {
            notebook = findNotebookRecursive(this.notebooks.state.values, id);
            if (notebook == null) throw Error(`No notebook with id ${id} found.`);
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

        const _undo = { ignore: true };

        this.commit('START_NOTEBOOKS_INPUT', { value: p, _undo });
        this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });

        if (parent != null) {
            this.notebooks.commit('SET_EXPANDED', {
                value: { notebook: parent, bubbleUp: true, expanded: true },
                _undo
            });
        }
    }

    notebookInputUpdated(value: string) {
        if (value === this.state.notebooks.input?.value) {
            return;
        }

        this.commit('SET_NOTEBOOKS_INPUT', { value, _undo: { ignore: true } });
    }

    notebookInputConfirm() {
        this.undoContext.group((_undo) => {
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
                        notebook.parent = this.notebooks.getters.byId(input.parentId, { required: true });
                    }

                    this.notebooks.commit('CREATE', {
                        value: notebook,
                        _undo: {
                            ..._undo,
                            undoCallback: (m) => {
                                this.notebooks.commit('DELETE', {
                                    value: { id: m.payload.value.id },
                                    _undo: { ignore: true }
                                });
                                this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
                            },
                            redoCallback: (m) => {
                                this.notebooks.commit('CREATE', m.payload);
                                this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
                            }
                        }
                    });
                    break;

                case 'update':
                    old = this.notebooks.getters.byId(input.id!)!;
                    this.notebooks.commit('SET_NAME', {
                        value: { notebook: old, newName: input.value },
                        _undo: {
                            ..._undo,
                            cache: {
                                oldName: old.value
                            },
                            undoCallback: (m) => {
                                this.notebooks.commit('SET_NAME', {
                                    value: {
                                        notebook: m.payload.value.notebook,
                                        newName: m.payload._undo.cache.oldName
                                    }
                                });
                                this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
                            },

                            redoCallback: (m) => {
                                this.notebooks.commit('SET_NAME', {
                                    value: { notebook: m.payload.value.notebook, newName: m.payload.value.newName }
                                });
                                this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
                            }
                        }
                    });
                    break;

                default:
                    throw Error(`Invalid notebook input mode ${this.state.notebooks.input?.mode}`);
            }

            _undo.ignore = true;
            this.commit('CLEAR_NOTEBOOKS_INPUT', { _undo });
            this.notebooks.commit('SORT', { _undo });
        });
    }

    notebookInputCancel() {
        this.commit('CLEAR_NOTEBOOKS_INPUT', { _undo: { ignore: true } });
    }

    async notebookDelete(id: string) {
        const notebook = this.notebooks.getters.byId(id, { required: true });

        if (await confirmDelete('notebook', notebook.value)) {
            this.undoContext.group((_undo) => {
                _undo.cache = {
                    id: notebook.id,
                    value: notebook.value,
                    parent: notebook.parent,
                    children: notebook.children
                };

                this.notebooks.commit('DELETE', {
                    value: { id: id },
                    _undo: {
                        ..._undo,
                        cache: {
                            notebook: notebook
                        },
                        undoCallback: (m) => {
                            this.notebooks.commit('CREATE', {
                                value: m.payload._undo.cache.notebook,
                                _undo: { ignore: true }
                            });
                            this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
                        },
                        redoCallback: (m) => {
                            this.notebooks.commit('DELETE', m.payload);
                            this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
                        }
                    }
                });

                // Find out what notebooks had the tag so we can cache it.
                const notesWithNotebook = this.notes.getters.notesByNotebook(id);
                _undo.cache.noteIds = notesWithNotebook.map((n) => n.id);

                this.notes.commit('REMOVE_NOTEBOOK', {
                    value: { notebookId: id },
                    _undo: {
                        ..._undo,
                        undoCallback: (m) =>
                            this.notes.commit('ADD_NOTEBOOK', {
                                value: { noteId: m.payload._undo.cache.noteIds, notebookId: m.payload.value.tagId },
                                _undo: { ignore: true }
                            }),
                        redoCallback: (m) =>
                            this.notes.commit('REMOVE_NOTEBOOK', { value: m.payload.value, _undo: { ignore: true } })
                    }
                });
            });
        }
    }

    async notebookDeleteAll() {
        if (await confirmDelete('every notebook', '')) {
            await this.undoContext.group((_undo) => {
                // Cache off notebooks
                _undo.cache.notebooks = [];
                for (const notebook of this.notebooks.getters.flatten) {
                    _undo.cache.notebooks.push({
                        id: notebook.id,
                        value: notebook.value,
                        noteIds: this.notes.getters.notesByNotebook(notebook.id).map((n) => n.id)
                    });
                }

                this.notebooks.commit('DELETE_ALL', {
                    _undo: {
                        ..._undo,
                        undoCallback: (m) => {
                            for (const notebook of _undo.cache.notebooks) {
                                this.notebooks.commit('CREATE', {
                                    value: { id: notebook.id, value: notebook.value },
                                    _undo: { ignore: true }
                                });

                                this.notes.commit('ADD_NOTEBOOK', {
                                    value: { noteId: notebook.noteIds, notebookId: notebook.id },
                                    _undo: { ignore: true }
                                });
                            }
                        },
                        redoCallback: (m) => {
                            this.notebooks.commit('DELETE_ALL', { _undo: { ignore: true } });
                        }
                    }
                });
            });
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
