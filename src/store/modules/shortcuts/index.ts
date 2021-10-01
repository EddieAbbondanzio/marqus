import { ShortcutState } from "./state";
import { createComposable, Module } from "vuex-smart-module";
import { ShortcutActions } from "@/store/modules/shortcuts/actions";
import { ShortcutMutations } from "@/store/modules/shortcuts/mutations";
import { ShortcutGetters } from "@/store/modules/shortcuts/getters";
import { persist } from "@/store/plugins/persist";
import { keyCodesToString, parseKeyCodes } from "@/utils/shortcuts";

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
  transformer,
  reviver
});

interface ShortcutRaw {
  name: string, keys: string
}

export function transformer(state: ShortcutState): { values: ShortcutRaw} {
  return {
    values: state.values
      .filter(sc => sc.userDefined)
      .map(({ keys, name }) => ({ keys: keyCodesToString(keys), name })) as any
  };
}

export function reviver(state: {
  values: ShortcutRaw[];
}): ShortcutState {
  return {
    values: state.values
      .map(({ keys, name }) => ({ keys: parseKeyCodes(keys), name, userDefined: true }))
  };
}
