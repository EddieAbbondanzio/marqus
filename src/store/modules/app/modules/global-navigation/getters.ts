import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { GlobalNavigation } from './state';

export const getters: GetterTree<GlobalNavigation, State> = {
    isTagBeingCreated: (s) => s.tags.input.mode === 'create',
    isTagBeingUpdated: (s) => (id: string) => {
        return s.tags.input.mode === 'update' && s.tags.input.id === id;
    },
    isNotebookBeingCreated: (s) => s.notebooks.input.mode === 'create',
    isNotebookBeingUpdated: (s) => (id: string) => {
        return s.notebooks.input.mode === 'update' && s.notebooks.input.id === id;
    }
};
