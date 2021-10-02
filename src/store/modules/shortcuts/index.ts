import { ShortcutMapping, ShortcutState } from "./state";
import { createComposable, Module } from "vuex-smart-module";
import { ShortcutActions } from "@/store/modules/shortcuts/actions";
import { ShortcutMutations } from "@/store/modules/shortcuts/mutations";
import { ShortcutGetters } from "@/store/modules/shortcuts/getters";
import { persist } from "@/store/plugins/persist";

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
  ignore: ["SET_STATE", "REMOVE_SHORTCUT_FOR_COMMAND", "KEY_DOWN", "KEY_UP", "CREATE_SHORTCUT"],
  transformer: (state: ShortcutState): ShortcutMapping[] => {
    const shortcutMappings = [];

    for (const [keys, mappings] of Object.entries(state.map)) {
      for (const { command, context } of mappings) {
        // Skip default ones
        if (!state.invertedMap[command].userDefined) {
          continue;
        }

        shortcutMappings.push({ keys, command, context });
      }
    }

    return shortcutMappings;
  },
  reviver: values => {
    return values.map((v: ShortcutMapping) => ({ ...v, userDefined: true }));
  }
});
