import { GlobalNavigationActions } from "@/store/modules/ui/modules/globalNavigation/actions";
import { GlobalNavigationGetters } from "@/store/modules/ui/modules/globalNavigation/getters";
import { GlobalNavigationMutations } from "@/store/modules/ui/modules/globalNavigation/mutations";
import { GlobalNavigationState } from "@/store/modules/ui/modules/globalNavigation/state";
import { Module } from "vuex-smart-module";

export const globalNavigation = new Module({
  namespaced: true,
  actions: GlobalNavigationActions,
  state: GlobalNavigationState,
  mutations: GlobalNavigationMutations,
  getters: GlobalNavigationGetters,
});
