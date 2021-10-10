import { UserInterfaceState } from "./state";
import { UserInterfaceGetters } from "./getters";
import { UserInterfaceActions } from "./actions";
import { UserInterfaceMutations } from "./mutations";
import { Module } from "vuex-smart-module";
import { globalNavigation } from "@/store/modules/ui/modules/globalNavigation";
import { localNavigation } from "@/store/modules/ui/modules/localNavigation";
import { editor } from "@/store/modules/ui/modules/editor";
import { commandConsole } from "./modules/commandConsole";

export const userInterface = new Module({
  namespaced: true,
  state: UserInterfaceState,
  getters: UserInterfaceGetters,
  mutations: UserInterfaceMutations,
  actions: UserInterfaceActions,
  modules: {
    globalNavigation,
    localNavigation,
    editor,
    commandConsole: commandConsole,
  },
});