import { State } from '@/store/store';
import { GetterTree } from 'vuex';
import { EditorState } from './state';

export const getters: GetterTree<EditorState, State> = {
    isTagBeingUpdated: (s) => (id: string) => {
        return s.globalNavigation.tags.input.mode === 'update' && s.globalNavigation.tags.input.id === id;
    },
    isNotebookBeingUpdated: (s) => (id: string) => {
        return s.globalNavigation.notebooks.input.mode === 'update' && s.globalNavigation.notebooks.input.id === id;
    }
};
