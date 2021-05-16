import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { Editor } from './state';

export const getters: GetterTree<Editor, State> = {
    noteName: (_s, _g, r) => (noteId: string) => {
        const note = r.notes.values.find((n) => n.id === noteId);
        return note?.name ?? '';
    },
    isTabActive: (s) => (tabId: string) => {
        if (s.activeTab == null) {
            return false;
        }

        return s.activeTab === tabId;
    }
};
