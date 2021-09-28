import { EditorActions } from "@/store/modules/ui/modules/editor/actions";
import { EditorGetters } from "@/store/modules/ui/modules/editor/getters";
import { EditorMutations } from "@/store/modules/ui/modules/editor/mutations";
import { EditorState } from "@/store/modules/ui/modules/editor/state";
import { mediator } from "@/store/plugins/mediator/mediator";
import { undo } from "@/store/plugins/undo/undo";
import { createComposable, Module } from "vuex-smart-module";

export const editor = new Module({
  namespaced: true,
  actions: EditorActions,
  state: EditorState,
  mutations: EditorMutations,
  getters: EditorGetters
});

export const useEditor = createComposable(editor);

/*
 * Anytime a note is clicked in the local navigation menu, open it as a tab in the editor.
 */
mediator.subscribe("ui/localNavigation/SET_ACTIVE", ({ payload }, store) => {
  const noteId = payload.value;
  store.dispatch("ui/editor/openTab", noteId);
});

/*
 * Close a tab if the note was deleted.
 */
mediator.subscribe("notes/DELETE", ({ payload }, store) => {
  const tab = store.getters["ui/editor/byNoteId"](payload.value);

  if (tab != null) {
    store.dispatch("ui/editor/closeTab", tab.id);
  }
});

undo.registerContext({
  name: "editor",
  namespace: "ui/editor",
  setStateMutation: "SET_STATE",
  stateCacheInterval: 1000
});
