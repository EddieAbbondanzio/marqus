import {
  NotebookState
} from "@/store/modules/notebooks/state";
import { createComposable, Module } from "vuex-smart-module";
import { NotebookActions } from "@/store/modules/notebooks/actions";
import { NotebookMutations } from "@/store/modules/notebooks/mutations";
import { NotebookGetters } from "@/store/modules/notebooks/getters";

export const notebooks = new Module({
  namespaced: true,
  actions: NotebookActions,
  state: NotebookState,
  mutations: NotebookMutations,
  getters: NotebookGetters
});

export const useNotebooks = createComposable(notebooks);
