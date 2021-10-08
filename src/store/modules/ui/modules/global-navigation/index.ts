import { GlobalNavigationActions } from "@/store/modules/ui/modules/global-navigation/actions";
import { GlobalNavigationGetters } from "@/store/modules/ui/modules/global-navigation/getters";
import { GlobalNavigationMutations } from "@/store/modules/ui/modules/global-navigation/mutations";
import { GlobalNavigationState } from "@/store/modules/ui/modules/global-navigation/state";
import { RecursivePartial } from "@/utils";
import { undo } from "@/store/plugins/undo";
import { createComposable, Module } from "vuex-smart-module";

export const globalNavigation = new Module({
  namespaced: true,
  actions: GlobalNavigationActions,
  state: GlobalNavigationState,
  mutations: GlobalNavigationMutations,
  getters: GlobalNavigationGetters
});

export const useGlobalNavigation = createComposable(globalNavigation);
