import { MutationTree } from 'vuex';
import { ShortcutState } from '@/features/shortcuts/store/state';
import { shortcutManager } from '@/features/shortcuts/directives/shortcut';

export const mutations: MutationTree<ShortcutState> = {
    SET_STATE(state, s: ShortcutState) {
        Object.assign(state, s);
        shortcutManager.register(s.values);
    }
};
