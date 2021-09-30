import { LocalNavigationActions } from "@/store/modules/ui/modules/local-navigation/actions";
import { LocalNavigationGetters } from "@/store/modules/ui/modules/local-navigation/getters";
import { LocalNavigationMutations } from "@/store/modules/ui/modules/local-navigation/mutations";
import { LocalNavigationState } from "@/store/modules/ui/modules/local-navigation/state";
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

undo.registerContext({
  name: "localNavigation",
  namespace: "ui/localNavigation",
  setStateAction: "SET_STATE",
  stateCacheInterval: 100
});
