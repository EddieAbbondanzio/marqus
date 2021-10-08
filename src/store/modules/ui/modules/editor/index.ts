import { EditorActions } from "@/store/modules/ui/modules/editor/actions";
import { EditorGetters } from "@/store/modules/ui/modules/editor/getters";
import { EditorMutations } from "@/store/modules/ui/modules/editor/mutations";
import { EditorState } from "@/store/modules/ui/modules/editor/state";
import { createComposable, Module } from "vuex-smart-module";

export const editor = new Module({
  namespaced: true,
  actions: EditorActions,
  state: EditorState,
  mutations: EditorMutations,
  getters: EditorGetters
});

export const useEditor = createComposable(editor);
