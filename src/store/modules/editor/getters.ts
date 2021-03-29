import { State } from '@/store/store';
import { GetterTree } from 'vuex';
import { EditorState } from './state';

export const getters: GetterTree<EditorState, State> = {
    tagInputMode: (s) => s.globalNavigation.tags.input.mode,
    isTagBeingUpdated: (s) => (id: string) => {
        return s.globalNavigation.tags.input.mode === 'update' && s.globalNavigation.tags.input.id === id;
    }
};
