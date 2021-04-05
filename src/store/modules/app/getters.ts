import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { AppState } from './state';

export const getters: GetterTree<AppState, State> = {
    isTagBeingUpdated: (s) => (id: string) => {
        return s.globalNavigation.tags.input.mode === 'update' && s.globalNavigation.tags.input.id === id;
    },
    isNotebookBeingUpdated: (s) => (id: string) => {
        return s.globalNavigation.notebooks.input.mode === 'update' && s.globalNavigation.notebooks.input.id === id;
    }
};
