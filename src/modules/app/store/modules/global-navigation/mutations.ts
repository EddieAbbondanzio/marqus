import { MutationTree } from 'vuex';
import { NotebookState } from '@/modules/notebooks/store/state';
import { generateId } from '@/core/store/entity';
import { findNotebookRecursive } from '@/modules/notebooks/store/mutations';
import { Tag } from '@/modules/tags/common/tag';
import { Notebook } from '@/modules/notebooks/common/notebook';
import { GlobalNavigation, GlobalNavigationEvent } from '@/modules/app/store/modules/global-navigation/state';
import { mapEventSourcedMutations } from '@/core/store/map-event-sourced-mutations';

export const mutations: MutationTree<GlobalNavigation> = {
    ...mapEventSourcedMutations<GlobalNavigation, GlobalNavigationEvent>({
        history: (s) => s.history,
        apply,
        undo
    })
};

export function apply(state: GlobalNavigation, event: GlobalNavigationEvent) {
    switch (event.type) {
        case 'activeChanged':
            state.active = event.newValue;
            break;

        case 'tagsExpanded':
            state.tags.expanded = event.newValue;
            break;

        case 'widthUpdated':
            state.width = event.newValue;
            break;

        case 'tagInputUpdated':
            state.tags.input!.value = event.newValue;
            break;

        case 'tagInputStarted':
            if (event.tag == null) {
                state.tags.input = {
                    mode: 'create',
                    value: ''
                };
            } else {
                state.tags.input = {
                    mode: 'update',
                    id: event.tag.id,
                    value: event.tag.value
                };
            }
            break;

        case 'tagInputCleared':
            delete state.tags.input;
            break;

        case 'notebooksExpanded':
            state.notebooks.expanded = event.newValue;
            break;

        case 'notebookInputStarted':
            if (event.notebook != null) {
                state.notebooks.input = {
                    mode: 'update',
                    id: event.notebook.id,
                    value: event.notebook.value,
                    parentId: event.parentId
                };
            } else {
                state.notebooks.input = {
                    mode: 'create',
                    value: '',
                    parentId: event.parentId
                };
            }
            break;

        case 'notebookInputCleared':
            delete state.notebooks.input;
            break;

        case 'notebookInputUpdated':
            state.notebooks.input!.value = event.newValue;
            break;

        case 'notebookDraggingUpdated':
            state.notebooks.dragging = event.newValue;
            break;
    }
}

export function undo(state: GlobalNavigation, event: GlobalNavigationEvent) {
    switch (event.type) {
        case 'activeChanged':
            state.active = event.oldValue;
            break;

        case 'tagsExpanded':
            state.tags.expanded = event.oldValue;
            break;

        case 'widthUpdated':
            state.width = event.oldValue;
            break;

        case 'tagInputUpdated':
            state.tags.input!.value = event.oldValue;
            break;

        case 'tagInputStarted':
            delete state.tags.input;
            break;

        case 'tagInputCleared':
            state.tags.input = event.oldValue;
            break;

        case 'notebooksExpanded':
            state.notebooks.expanded = event.oldValue;
            break;

        case 'notebookInputStarted':
            delete state.notebooks.input;
            break;

        case 'notebookInputCleared':
            state.notebooks.input = event.oldValue;
            break;

        case 'notebookInputUpdated':
            state.notebooks.input!.value = event.oldValue;
            break;

        case 'notebookDraggingUpdated':
            state.notebooks.dragging = event.oldValue;
            break;
    }
}
