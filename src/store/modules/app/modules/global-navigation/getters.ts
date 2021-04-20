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
        if (s.notebooks.input.mode !== 'create') {
            return false;
        } else if (parentId != null) {
            return s.notebooks.input.parent?.id === parentId;
        } else {
            // Need to handle the case were no parentId was passed, but new notebook has parent.
            return s.notebooks.input.parent == null;
        }
    },
    isNotebookBeingUpdated: (s) => (id: string) => {
        return s.notebooks.input.mode === 'update' && s.notebooks.input.id === id;
    },
    canNotebookBeCollapsed: (s) => (n: Notebook) => {
        if (s.notebooks.input.mode === 'create') {
            return s.notebooks.input.parent?.id === n.id;
        } else {
            return (n.children?.length ?? 0) > 0;
        }
    }
};
