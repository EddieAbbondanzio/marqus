import { shortcutManager } from '@/features/shortcuts/directives/shortcut';
import { ShortcutGetters } from '@/features/shortcuts/store/getters';
import { ShortcutMutations } from '@/features/shortcuts/store/mutations';
import { ShortcutState } from '@/features/shortcuts/store/state';
import { ActionTree, Store } from 'vuex';
import { Actions } from 'vuex-smart-module';

export class ShortcutActions extends Actions<ShortcutState, ShortcutGetters, ShortcutMutations, ShortcutActions> {
    $init(store: Store<any>) {
        // Needed for defaults in case no file was loaded.
        shortcutManager.register(this.state.values);
    }
}
