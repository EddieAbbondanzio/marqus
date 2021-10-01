import { ShortcutState } from "./state";
import { createComposable, Module } from "vuex-smart-module";
import { ShortcutActions } from "@/store/modules/shortcuts/actions";
import { ShortcutMutations } from "@/store/modules/shortcuts/mutations";
import { ShortcutGetters } from "@/store/modules/shortcuts/getters";
import { persist } from "@/store/plugins/persist";
import { ShortcutMapping } from "@/utils/shortcuts";

export const shortcuts = new Module({
  namespaced: true,
  actions: ShortcutActions,
  mutations: ShortcutMutations,
  getters: ShortcutGetters,
  state: ShortcutState
});

export const useShortcuts = createComposable(shortcuts);

persist.register({
  namespace: "shortcuts",
  setStateAction: "setState",
  ignore: ["SET_STATE"],
  transformer: state => state.values,
  reviver: values => ({ values: values.map((v: ShortcutMapping) => ({ ...v, userDefined: true })) })
});
