import { ShortcutState } from './state';
import { persist } from '@/store/plugins/persist/persist';
import { shortcutFromString } from '@/features/shortcuts/common/shortcut';
import { DEFAULT_SHORTCUTS } from '@/features/shortcuts/common/default-shortcuts';
import { Module } from 'vuex-smart-module';
import { ShortcutActions } from '@/features/shortcuts/store/actions';
import { ShortcutMutations } from '@/features/shortcuts/store/mutations';
import { ShortcutGetters } from '@/features/shortcuts/store/getters';
import { undo } from '@/store/plugins/undo';

export const shortcuts = new Module({
    namespaced: true,
    actions: ShortcutActions,
    mutations: ShortcutMutations,
    getters: ShortcutGetters,
    state: ShortcutState
});

persist.register({
    namespace: 'shortcuts',
    initMutation: 'SET_STATE',
    transformer,
    reviver
});

export function transformer(state: ShortcutState): any {
    return {
        values: state.values.filter((s) => s.isUserDefined).map((s) => ({ name: s.name, keys: s.toString() }))
    };
}

export function reviver(state: { values: { name: string; keys: string }[] }): ShortcutState {
    const shortcuts = state.values.map((s) => shortcutFromString(s.name, s.keys, true));

    // Check if any default shortcuts were overrided.
    for (const defaultSC of DEFAULT_SHORTCUTS) {
        const overridedSC = shortcuts.find((s) => s.name === defaultSC.name);
        shortcuts.push(overridedSC ?? defaultSC);
    }

    // TODO: Add support for custom shortcuts that the user creates, and don't have defaults.

    return {
        values: shortcuts
    };
}
