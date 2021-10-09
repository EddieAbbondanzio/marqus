import { LocalNavigationActions } from "@/store/modules/ui/modules/localNavigation/actions";
import { LocalNavigationGetters } from "@/store/modules/ui/modules/localNavigation/getters";
import { LocalNavigationMutations } from "@/store/modules/ui/modules/localNavigation/mutations";
import { LocalNavigationState } from "@/store/modules/ui/modules/localNavigation/state";
import { undo } from "@/store/plugins/undo/undo";
import { createComposable, Module } from "vuex-smart-module";

export const localNavigation = new Module({
  namespaced: true,
  actions: LocalNavigationActions,
  state: LocalNavigationState,
  mutations: LocalNavigationMutations,
  getters: LocalNavigationGetters
});

export const useLocalNavigation = createComposable(localNavigation);
