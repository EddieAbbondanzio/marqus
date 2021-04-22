import { Notebook } from '@/store/modules/notebooks/state';
import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { GlobalNavigation } from './state';

export const getters: GetterTree<GlobalNavigation, State> = {
    indentation: (s) => (depth: number) => {
        return `${depth * 24}px`;
    },
    isTagBeingCreated: (s) => s.tags.input.mode === 'create',
    isTagBeingUpdated: (s) => (id: string) => {
        return s.tags.input.mode === 'update' && s.tags.input.id === id;
    },
    isNotebookBeingCreated: (s) => (parentId: string) => {
        // Check to see if we are even in create mode first
        if (s.notebooks.input.mode !== 'create') {
            return false;
        }

        // Now check to see if we're testing for a root notebook create
        if (parentId == null) {
            return s.notebooks.input.parent == null;
        }

        // Lastly, test for a nested notebook create
        if (parentId != null) {
            return s.notebooks.input.parent!.id === parentId;
        }

        // If we somehow got here, halt and catch fire.
        throw Error();
    },
    isNotebookBeingUpdated: (s) => (id: string) => {
        return s.notebooks.input.mode === 'update' && s.notebooks.input.id === id;
    },
    canNotebookBeCollapsed: (s) => (n: Notebook) => {
        return (n.children?.length ?? 0) > 0;
    }
};
