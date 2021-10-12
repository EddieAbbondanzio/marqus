import { createComposable, Module } from "vuex-smart-module";
import { NoteActions } from "@/store/modules/notes/actions";
import { NoteMutations } from "@/store/modules/notes/mutations";
import { NoteGetters } from "@/store/modules/notes/getters";
import { NoteState } from "./state";

export const notes = new Module({
  namespaced: true,
  actions: NoteActions,
  mutations: NoteMutations,
  getters: NoteGetters,
  state: NoteState,
});
