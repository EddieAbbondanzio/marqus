import { createComposable, Module } from "vuex-smart-module";
import { ConsoleActions } from "./actions";
import { ConsoleGetters } from "./getters";
import { ConsoleMutations } from "./mutations";
import { ConsoleState } from "./state";

export const commandConsole = new Module({
  namespaced: true,
  actions: ConsoleActions,
  state: ConsoleState,
  mutations: ConsoleMutations,
  getters: ConsoleGetters
});

export const useConsole =
 createComposable(commandConsole);
