import { MutationTree, Store } from 'vuex';
import { ShortcutState } from '@/features/shortcuts/store/state';
import { Mutations } from 'vuex-smart-module';
import { shortcutManager } from '@/features/shortcuts/shared/shortcut-manager';

export class ShortcutMutations extends Mutations<ShortcutState> {
    SET_STATE(s: ShortcutState) {
        Object.assign(this.state, s);
        shortcutManager.register(s.values);
    }
}
