import { MutationTree, Store } from 'vuex';
import { ShortcutState } from '@/features/shortcuts/store/state';
import { shortcutManager } from '@/features/shortcuts/directives/shortcut';
import { Mutations } from 'vuex-smart-module';

export class ShortcutMutations extends Mutations<ShortcutState> {
    SET_STATE(s: ShortcutState) {
        Object.assign(this.state, s);
        shortcutManager.register(s.values);
    }
}
