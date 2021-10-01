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

// persist.register({
//   namespace: "shortcuts",
//   setStateAction: "setState",
//   transformer,
//   reviver
// });

// export function transformer(state: ShortcutState): any {
//   const customShortcuts = _.difference(state.values, DEFAULT_SHORTCUTS);

//   return {
//     values: customShortcuts.map(s => ({ keys: s.keys, command: s.name }))
//   };
// }

// export function reviver(state: {
//   values: { command: string; keys: string }[];
// }): ShortcutState {
//   return {
//     values: [] // state.values.map(s => ({ keys: parseKeyCodes(s.keys), command: s.command }))
//   };
// }
