import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { LocalNavigation } from './state';

export const getters: GetterTree<LocalNavigation, State> = {
    isCreatingNote: (s) => s.notes.input?.mode === 'create'
};
