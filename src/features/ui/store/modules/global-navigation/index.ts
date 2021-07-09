import { GlobalNavigationActions } from '@/features/ui/store/modules/global-navigation/actions';
import { GlobalNavigationGetters } from '@/features/ui/store/modules/global-navigation/getters';
import { GlobalNavigationMutations } from '@/features/ui/store/modules/global-navigation/mutations';
import { GlobalNavigationState } from '@/features/ui/store/modules/global-navigation/state';
import { undo } from '@/store/plugins/undo';
import { Module } from 'vuex-smart-module';

export const globalNavigation = new Module({
    namespaced: true,
    actions: GlobalNavigationActions,
    state: GlobalNavigationState,
    mutations: GlobalNavigationMutations,
    getters: GlobalNavigationGetters
});

undo.registerModule(new GlobalNavigationState(), {
    name: 'globalNavigation',
    namespace: 'globalNavigation',
    setStateMutation: 'SET_STATE',
    stateCacheInterval: 100
});
