import { ShortcutState } from './state';
import { persist } from '@/store/plugins/persist/persist';
import { shortcutFromString } from '@/features/shortcuts/shared/shortcut';
import { DEFAULT_SHORTCUTS } from '@/features/shortcuts/shared/default-shortcuts';
import { createComposable, Module } from 'vuex-smart-module';
import { ShortcutActions } from '@/features/shortcuts/store/actions';
import { ShortcutMutations } from '@/features/shortcuts/store/mutations';
import { ShortcutGetters } from '@/features/shortcuts/store/getters';

export const shortcuts = new Module({
    namespaced: true,
    actions: ShortcutActions,
    mutations: ShortcutMutations,
    getters: ShortcutGetters,
    state: ShortcutState
});

export const useShortcuts = createComposable(shortcuts);

persist.register({
    namespace: 'shortcuts',
    initMutation: 'SET_STATE',
    transformer,
    reviver
});

export function transformer(state: ShortcutState): any {
    return {
        values: state.values.filter((s) => s.wasOverrided).map((s) => ({ name: s.name, keys: s.toString() }))
    };
}

export function reviver(state: { values: { name: string; keys: string }[] }): ShortcutState {
    const overrides = state.values.map((s) => shortcutFromString(s.name, s.keys, true));
    const shortcuts = Array.from(DEFAULT_SHORTCUTS);

    // Check if any default shortcuts were overrided.
    for (const defaultSC of shortcuts) {
        const overridedSC = overrides.find((s) => s.name === defaultSC.name);

        if (overridedSC != null) {
            defaultSC.override(overridedSC.keys);
        }
    }

    // TODO: Add support for custom shortcuts that the user creates, and don't have defaults.

    return {
        values: shortcuts
    };
}
