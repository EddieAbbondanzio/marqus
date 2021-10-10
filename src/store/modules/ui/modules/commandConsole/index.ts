import { createComposable, Module } from "vuex-smart-module";
import { CommandConsoleActions } from "./actions";
import { CommandConsoleGetters } from "./getters";
import { CommandConsoleMutations } from "./mutations";
import { CommandConsoleState } from "./state";

export const commandConsole = new Module({
  namespaced: true,
  actions: CommandConsoleActions,
  state: CommandConsoleState,
  mutations: CommandConsoleMutations,
  getters: CommandConsoleGetters,
});

export const useCommandConsole = createComposable(commandConsole);
