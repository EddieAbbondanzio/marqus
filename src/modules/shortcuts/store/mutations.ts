import { MutationTree } from 'vuex';
import { ShortcutState } from '@/modules/shortcuts/store/state';
import { shortcutManager } from '@/modules/shortcuts/directives/shortcut';

export const mutations: MutationTree<ShortcutState> = {
    INIT(state, s: ShortcutState) {
        Object.assign(state, s);
        shortcutManager.register(s.values);
    }
};
