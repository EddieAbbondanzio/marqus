import { ShortcutState, state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { persist } from '@/store/plugins/persist/persist';
import { Shortcut, shortcutFromString } from '@/directives/shortcut';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

persist.register({
    namespace: 'shortcuts',
    initMutation: 'INIT',
    transformer,
    reviver
});

export function transformer(state: ShortcutState): any {
    return {
        values: state.values.filter((s) => s.isUserDefined).map((s) => ({ name: s.name, keys: s.toString() }))
    };
}

export function reviver(state: { values: { name: string; keys: string }[] }): ShortcutState {
    return {
        values: state.values.map((s) => shortcutFromString(s.name, s.keys, true))
    };
}
