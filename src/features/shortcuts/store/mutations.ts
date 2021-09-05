import { MutationTree, Store } from 'vuex';
import { ShortcutState } from '@/features/shortcuts/store/state';
import { Mutations } from 'vuex-smart-module';
import { shortcuts } from '@/features/shortcuts/shared/shortcuts';

export class ShortcutMutations extends Mutations<ShortcutState> {
    SET_STATE(s: ShortcutState) {
        Object.assign(this.state, s);
        shortcuts.register(s.values);
    }
}
