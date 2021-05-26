import { MutationTree } from 'vuex';
import { ShortcutState } from '@/store/modules/shortcuts/state';

export const mutations: MutationTree<ShortcutState> = {
    INIT(state, s: ShortcutState) {
        Object.assign(state, s);
    }
};
