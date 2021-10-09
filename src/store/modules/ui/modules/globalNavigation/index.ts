import { GlobalNavigationActions } from "@/store/modules/ui/modules/globalNavigation/actions";
import { GlobalNavigationGetters } from "@/store/modules/ui/modules/globalNavigation/getters";
import { GlobalNavigationMutations } from "@/store/modules/ui/modules/globalNavigation/mutations";
import { GlobalNavigationState } from "@/store/modules/ui/modules/globalNavigation/state";
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
