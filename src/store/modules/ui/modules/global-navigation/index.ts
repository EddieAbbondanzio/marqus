import { GlobalNavigationActions } from "@/store/modules/ui/modules/global-navigation/actions";
import { GlobalNavigationGetters } from "@/store/modules/ui/modules/global-navigation/getters";
import { GlobalNavigationMutations } from "@/store/modules/ui/modules/global-navigation/mutations";
import { GlobalNavigationState } from "@/store/modules/ui/modules/global-navigation/state";
import { RecursivePartial } from "@/utils/recursive-partial";
import { undo } from "@/store/plugins/undo";
import { createComposable, createMapper, Module } from "vuex-smart-module";

export const globalNavigation = new Module({
  namespaced: true,
  actions: GlobalNavigationActions,
  state: GlobalNavigationState,
  mutations: GlobalNavigationMutations,
  getters: GlobalNavigationGetters
});

undo.registerContext({
  name: "globalNavigation",
  namespace: "ui/globalNavigation",
  setStateTransformer: (state: RecursivePartial<GlobalNavigationState>) => {
    // Nuke out visual state so we don't accidentally overwrite it.
    delete state.width;
    return state;
  }
});

export const useGlobalNavigation = createComposable(globalNavigation);
