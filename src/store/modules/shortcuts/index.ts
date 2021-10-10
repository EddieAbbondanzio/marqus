import { ShortcutState } from "./state";
import { createComposable, Module } from "vuex-smart-module";
import { ShortcutActions } from "@/store/modules/shortcuts/actions";
import { ShortcutMutations } from "@/store/modules/shortcuts/mutations";
import { ShortcutGetters } from "@/store/modules/shortcuts/getters";

export const shortcuts = new Module({
  namespaced: true,
  actions: ShortcutActions,
  mutations: ShortcutMutations,
  getters: ShortcutGetters,
  state: ShortcutState
});

export const useShortcuts = createComposable(shortcuts);
