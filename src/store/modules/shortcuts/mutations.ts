import { MutationTree } from 'vuex';
import { ShortcutState } from '@/store/modules/shortcuts/state';
import { shortcutManager } from '@/directives/shortcut';

export const mutations: MutationTree<ShortcutState> = {
    INIT(state, s: ShortcutState) {
        Object.assign(state, s);
        shortcutManager.register(s.values);
    }
};
