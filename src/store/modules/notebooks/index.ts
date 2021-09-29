import { persist } from "@/store/plugins/persist/persist";
import {
  fixNotebookParentReferences,
  killNotebookParentReferences
  , NotebookState
} from "@/store/modules/notebooks/state";
import { createComposable, Module } from "vuex-smart-module";
import { NotebookActions } from "@/store/modules/notebooks/actions";

import { NotebookMutations } from "@/store/modules/notebooks/mutations";
import { NotebookGetters } from "@/store/modules/notebooks/getters";
import { undo } from "@/store/plugins/undo";

export const notebooks = new Module({
  namespaced: true,
  actions: NotebookActions,
  state: NotebookState,
  mutations: NotebookMutations,
  getters: NotebookGetters
});

export const useNotebooks = createComposable(notebooks);

persist.register({
  namespace: "notebooks",
  setStateAction: "setState",
  reviver: (s: NotebookState) => {
    for (const n of s.values) {
      fixNotebookParentReferences(n);
    }

    return s;
  },
  transformer: (s: NotebookState) => {
    /*
     * Need to nuke .parent references before serializing or else JSON.strigify
     * will throw error due to circular references.
     */
    for (const n of s.values) {
      killNotebookParentReferences(n);
    }

    return s;
  }
});
