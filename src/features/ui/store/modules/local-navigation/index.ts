import { state } from '@/features/ui/store/modules/editor/state';
import { LocalNavigationActions } from '@/features/ui/store/modules/local-navigation/actions';
import { LocalNavigationGetters } from '@/features/ui/store/modules/local-navigation/getters';
import { LocalNavigationMutations } from '@/features/ui/store/modules/local-navigation/mutations';
import { LocalNavigationState } from '@/features/ui/store/modules/local-navigation/state';
import { undo } from '@/store/plugins/undo/undo';
import { createComposable, Module } from 'vuex-smart-module';

export const localNavigation = new Module({
    namespaced: true,
    actions: LocalNavigationActions,
    state: LocalNavigationState,
    mutations: LocalNavigationMutations,
    getters: LocalNavigationGetters
});

export const useLocalNavigation = createComposable(localNavigation);

undo.registerModule(state, {
    name: 'localNavigation',
    namespace: 'ui/localNavigation',
    setStateMutation: 'SET_STATE',
    stateCacheInterval: 100
});
