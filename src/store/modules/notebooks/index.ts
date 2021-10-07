import { persist } from "@/store/plugins/persist";
import {
  fixNotebookParentReferences,
  killNotebookParentReferences
  , Notebook, notebookSchema, NotebookState
} from "@/store/modules/notebooks/state";
import { createComposable, Module } from "vuex-smart-module";
import { NotebookActions } from "@/store/modules/notebooks/actions";

import { NotebookMutations } from "@/store/modules/notebooks/mutations";
import { NotebookGetters } from "@/store/modules/notebooks/getters";
import * as yup from "yup";

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
  reviver: (values: Notebook[]) => {
    for (const n of values) {
      fixNotebookParentReferences(n);
    }

    return { values };
  },
  transformer: (s: NotebookState) => {
    /*
     * Need to nuke .parent references before serializing or else JSON.strigify
     * will throw error due to circular references.
     */
    for (const n of s.values) {
      killNotebookParentReferences(n);
    }

    return s.values;
  },
  schema: yup.array().of(notebookSchema)
});
