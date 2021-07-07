import { Notebook } from '@/features/notebooks/common/notebook';
import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { GlobalNavigationState, GlobalNavigationActive } from './state';

export const getters: GetterTree<GlobalNavigationState, State> = {
    isActive: (s) => (active: GlobalNavigationActive) => {
        switch (s.active?.section) {
            case 'all':
            case 'favorites':
            case 'trash':
                return active.section === s.active.section;
            case 'notebook':
            case 'tag':
                return active.section === s.active.section && active.id === s.active.id;
            default:
                return false;
        }
    },
    indentation: (s) => (depth: number) => {
        return `${depth * 24}px`;
    },
    isTagBeingCreated: (s) => s.tags.input?.mode === 'create',
    isTagBeingUpdated: (s) => (id: string) => {
        return s.tags.input?.mode === 'update' && s.tags.input.id === id;
    },
    isNotebookBeingCreated: (s) => (parentId: string | null) => {
        // Check to see if we are even in create mode first
        if (s.notebooks.input?.mode !== 'create') {
            return false;
        }

        // Now check to see if we're testing for a root notebook create
        if (parentId == null) {
            return s.notebooks.input.parentId == null;
        }

        // Lastly, test for a nested notebook create
        if (parentId != null) {
            return s.notebooks.input.parentId === parentId;
        }

        // If we somehow got here, halt and catch fire.
        throw Error();
    },
    isNotebookBeingUpdated: (s) => (id: string) => {
        return s.notebooks.input?.mode === 'update' && s.notebooks.input.id === id;
    },
    isNotebookBeingDragged: (s) => s.notebooks.dragging != null,
    canNotebookBeCollapsed: (s) => (n: Notebook) => {
        return (n.children?.length ?? 0) > 0;
    }
};
