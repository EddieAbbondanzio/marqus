import { Notebook } from '@/features/notebooks/common/notebook';
import { tagStore } from '@/features/tags/store/tag-store';
import type { GlobalNavigationActive, GlobalNavigationState } from '@/features/ui/store/modules/global-navigation/state';
import { confirmDelete } from '@/shared/utils';
import { Action, Getter, Module, Mutation } from '@/store/common/class-modules/decorators';
import { VuexModule } from '@/store/common/class-modules/vuex-module';
import { Store } from 'vuex';

@Module({ namespace: 'globalNavigation' })
export class GlobalNavigationStore extends VuexModule {
    state: GlobalNavigationState;

    constructor(store: Store<any>) {
        super(store);

        this.state = {
            active: {
                section: 'all'
            },
            notebooks: {
                expanded: false
            },
            tags: {
                expanded: false
            },
            width: '300px'
        };
    }

    @Getter()
    get isActive() {
        return (active: GlobalNavigationActive) => {
            switch (this.state.active?.section) {
                case 'all':
                case 'favorites':
                case 'trash':
                    return active.section === this.state.active.section;
                case 'notebook':
                case 'tag':
                    return active.section === this.state.active.section && active.id === this.state.active.id;
                default:
                    return false;
            }
        };
    }

    @Getter()
    get indentation() {
        return (depth: number) => {
            return `${depth * 24}px`;
        };
    }

    @Getter()
    get isTagBeingCreated() {
        return this.state.tags.input?.mode === 'create';
    }

    @Getter()
    get isTagBeingUpdated() {
        return (id: string) => {
            return this.state.tags.input?.mode === 'update' && this.state.tags.input.id === id;
        };
    }

    @Getter()
    get isNotebookBeingCreated() {
        return (parentId: string | null) => {
            // Check to see if we are even in create mode first
            if (this.state.notebooks.input?.mode !== 'create') {
                return false;
            }

            // Now check to see if we're testing for a root notebook create
            if (parentId == null) {
                return this.state.notebooks.input.parentId == null;
            }

            // Lastly, test for a nested notebook create
            if (parentId != null) {
                return this.state.notebooks.input.parentId === parentId;
            }

            // If we somehow got here, halt and catch fire.
            throw Error();
        };
    }

    @Getter()
    get isNotebookBeingUpdated() {
        return (id: string) => {
            return this.state.notebooks.input?.mode === 'update' && this.state.notebooks.input.id === id;
        };
    }

    @Getter()
    get isNotebookBeingDragged() {
        return this.state.notebooks.dragging != null;
    }

    @Getter()
    get canNotebookBeCollapsed() {
        return (n: Notebook) => {
            return (n.children?.length ?? 0) > 0;
        };
    }

    @Action()
    tagInputStart({ id }: { id?: string } = {}) {
        this.START_TAGS_INPUT(id);
        this.SET_TAGS_EXPANDED({ value: true });
    }

    @Action()
    tagInputConfirm() {
        switch (this.state.tags.input?.mode) {
            case 'create':
                tagStore.CREATE({ value: this.state.tags.input.value });
                break;

            case 'update':
                tagStore.UPDATE_VALUE({ id: this.state.tags.input.id!, value: this.state.tags.input.value });
                break;

            default:
                throw Error(`Invalid tag input`);
        }

        tagStore.SORT();
        this.CLEAR_TAGS_INPUT();
    }

    @Action()
    async tagDelete(id: string) {
        const tag = tagStore.getTagById(id);

        const confirm = await confirmDelete('tag', tag.value);

        if (confirm) {
            tagStore.DELETE({ id });
            console.log('uncomment notes/REMOVE_TAG');
            // commit('notes/REMOVE_TAG', { tagId: id }, { root: true });
        }
    }

    // @Action()
    // notebookInputStart( { id, parentId }: { id?: string; parentId?: string } = {}) {
    //     let notebook: Notebook | undefined;
    //     let parent: Notebook | undefined;

    //     /*
    //      * id != null -> update
    //      * id == null -> create, check if we put it under root, or a parent (parentId != null)
    //      */

    //     if (id != null) {
    //         notebook = findNotebookRecursive(rootState.notebooks.values, id);

    //         if (notebook == null) {
    //             throw new Error(`No notebook with id ${id} found.`);
    //         }
    //     }

    //     if (id == null && parentId != null) {
    //         parent = findNotebookRecursive(rootState.notebooks.values, parentId);
    //     }

    //     const p: any = {
    //         type: 'notebookInputStarted',
    //         parentId: parent?.id
    //     };

    //     if (notebook != null) {
    //         p.notebook = {
    //             id: notebook.id,
    //             value: notebook.value
    //         };
    //     }

    //     commit('START_NOTEBOOKS_INPUT', p);

    //     if (parent != null) {
    //         commit('notebooks/EXPANDED', { notebook: parent, bubbleUp: true }, { root: true });
    //     }
    // }

    // @Action()
    // notebookInputConfirm() {
    //     const input = state.notebooks.input!;
    //     let notebook: Notebook;
    //     let old: Notebook | undefined;

    //     switch (state.notebooks.input?.mode) {
    //         case 'create':
    //             notebook = {
    //                 id: generateId(),
    //                 value: input.value,
    //                 expanded: false
    //             };

    //             if (input.parentId != null) {
    //                 notebook.parent = findNotebookRecursive(rootState.notebooks.values, input.parentId)!;
    //             }

    //             commit('notebooks/CREATE', notebook, { root: true });
    //             break;

    //         case 'update':
    //             old = rootState.notebooks.values.find((n) => n.id === input.id)!;

    //             notebook = {
    //                 id: old.id,
    //                 value: input.value,
    //                 expanded: old.expanded,
    //                 children: old.children,
    //                 parent: old.parent
    //             };

    //             commit('notebooks/UPDATE', notebook, { root: true });
    //             break;

    //         default:
    //             throw new Error(`Invalid notebook input mode ${state.notebooks.input?.mode}`);
    //     }

    //     commit('CLEAR_NOTEBOOKS_INPUT');

    //     commit('notebooks/SORT', null, { root: true });
    // }

    // @Action()
    // async notebookDelete( id: string) {
    //     const notebook = findNotebookRecursive(rootState.notebooks.values, id)!;

    //     if (await confirmDelete('notebook', notebook.value)) {
    //         commit('notebooks/DELETE', id, { root: true });
    //         commit('notes/REMOVE_NOTEBOOK', { notebookId: id }, { root: true });
    //     }
    // }

    // @Action()
    // notebookDragStart( notebook: Notebook) {
    //     commit('SET_NOTEBOOKS_DRAGGING', notebook.id);
    // }

    // @Action()
    // async notebookDragStop(endedOnId: string | null) {
    //     const dragging: Notebook = findNotebookRecursive(rootState.notebooks.values, state.notebooks.dragging!)!;

    //     if (dragging == null) {
    //         throw new Error('No drag to finalize.');
    //     }

    //     /*
    //      * Don't allow a move if we started and stopped on the same element, or if
    //      * we are attempting to move a parent to a child of it.
    //      */
    //     if (dragging.id !== endedOnId && findNotebookRecursive(dragging.children!, endedOnId!) == null) {
    //         // Remove from old location
    //         commit('notebooks/DELETE', dragging.id, { root: true });

    //         let parent: Notebook | undefined;

    //         if (endedOnId != null) {
    //             parent = findNotebookRecursive(rootState.notebooks.values, endedOnId);
    //         }

    //         /*
    //          * Check for a notebook with the same name in the new destination. If one exists,
    //          * we'll need to verify with the user that they want to replace it.
    //          */
    //         const newSiblings =
    //             endedOnId == null
    //                 ? rootState.notebooks.values
    //                 : findNotebookRecursive(rootState.notebooks.values, endedOnId)?.children ?? [];

    //         const duplicate = newSiblings.find((n) => n.value === dragging.value);
    //         if (duplicate != null) {
    //             const confirmReplace = await confirmReplaceNotebook(dragging.value);

    //             if (confirmReplace) {
    //                 commit('notebooks/DELETE', duplicate.id, { root: true });
    //             }
    //         }

    //         // Insert into new spot
    //         commit(
    //             'notebooks/CREATE',
    //             {
    //                 id: dragging.id,
    //                 value: dragging.value,
    //                 parent,
    //                 children: dragging.children,
    //                 expanded: dragging.expanded
    //             },
    //             { root: true }
    //         );

    //         if (parent) {
    //             commit('notebooks/EXPANDED', { notebook: parent, expanded: true, bubbleUp: true }, { root: true });
    //         }

    //         commit('SET_NOTEBOOKS_DRAGGING');

    //         commit('notebooks/SORT', null, { root: true });
    //     }
    // }

    // @Action()
    // notebookDragCancel() {
    //     commit('SET_NOTEBOOKS_DRAGGING');
    // },

    // @Action()
    // expandAll() {
    //     commit('SET_TAGS_EXPANDED', true);
    //     commit('SET_NOTEBOOKS_EXPANDED', true);
    //     commit('notebooks/SET_ALL_EXPANDED', true, { root: true });
    // }

    // @Action()
    // collapseAll() {
    //     commit('TAGS_EXPANDED_UPDATED', false);
    //     commit('NOTEBOOKS_EXPANDED_UPDATED', false);
    //     commit('notebooks/SET_ALL_EXPANDED', false, { root: true });
    // }

    // @Action()
    // async emptyTrash() {
    //     if (await confirmDelete('the trash', 'permanently')) {
    //         commit('notes/EMPTY_TRASH', null!, { root: true });
    //     }
    // }

    @Mutation()
    SET_STATE(s: GlobalNavigationState) {
        this.state = s;
    }

    @Mutation()
    SET_ACTIVE(newValue: GlobalNavigationActive) {
        this.state.active = newValue;
    }

    @Mutation()
    SET_WIDTH(newValue: string) {
        this.state.width = newValue;
    }

    @Mutation()
    SET_TAGS_EXPANDED({ value }: { value: boolean }) {
        this.state.tags.expanded = value;
    }

    @Mutation()
    SET_TAGS_INPUT(newValue: string) {
        if (this.state.tags.input == null) {
            throw Error('No tag input to update.');
        }

        this.state.tags.input.value = newValue;
    }

    @Mutation()
    START_TAGS_INPUT(id?: string) {
        if (id == null) {
            this.tags.input = {
                mode: 'create',
                value: ''
            };
        } else {
            const tag = tagStore.getTagById(id);

            this.state.tags.input = {
                mode: 'update',
                id: tag.id,
                value: tag.value
            };
        }
    }

    @Mutation()
    CLEAR_TAGS_INPUT() {
        delete this.state.tags.input;
    }

    @Mutation()
    SET_NOTEBOOKS_EXPANDED({ value: newValue }: { value: boolean }) {
        this.state.notebooks.expanded = newValue;
    }

    @Mutation()
    SET_NOTEBOOKS_INPUT({ value }: { value: string }) {
        if (this.state.notebooks.input == null) {
            throw Error('No notebook input to update.');
        }

        this.state.notebooks.input.value = value;
    }

    @Mutation()
    START_NOTEBOOKS_INPUT({ notebook, parentId }: { notebook?: { id: string; value: string }; parentId?: string }) {
        if (notebook != null) {
            this.state.notebooks.input = {
                mode: 'update',
                id: notebook.id,
                value: notebook.value,
                parentId
            };
        } else {
            this.state.notebooks.input = {
                mode: 'create',
                value: '',
                parentId
            };
        }
    }

    @Mutation()
    CLEAR_NOTEBOOKS_INPUT() {
        delete this.state.notebooks.input;
    }

    @Mutation()
    SET_NOTEBOOKS_DRAGGING({ value }: { value: string }) {
        this.state.notebooks.dragging = value;
    }
}
