import { UserInterfaceState } from "./state";
import { UserInterfaceGetters } from "./getters";
import { UserInterfaceActions } from "./actions";
import { UserInterfaceMutations } from "./mutations";
import { persist } from "@/store/plugins/persist";
import { Module } from "vuex-smart-module";
import { globalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { localNavigation } from "@/store/modules/ui/modules/local-navigation";
import { editor } from "@/store/modules/ui/modules/editor";
import { GlobalNavigationState } from "@/store/modules/ui/modules/global-navigation/state";
import { EditorState } from "@/store/modules/ui/modules/editor/state";
import { LocalNavigationState } from "@/store/modules/ui/modules/local-navigation/state";
import { RecursivePartial } from "@/utils";
import { mediator } from "@/store/plugins/mediator";
import { undo } from "@/store/plugins/undo";
import { commandConsole } from "./modules/command-console";
import { CommandConsoleState } from "./modules/command-console/state";

export const userInterface = new Module({
  namespaced: true,
  state: UserInterfaceState,
  getters: UserInterfaceGetters,
  mutations: UserInterfaceMutations,
  actions: UserInterfaceActions,
  modules: {
    globalNavigation,
    localNavigation,
    editor,
    commandConsole: commandConsole
  }
});

/**
 * Type to give us some compile time safety to help prevent errors in case
 * any property names are changed.
 */
export type PersistedUserInterfaceState = RecursivePartial<{
    globalNavigation: GlobalNavigationState,
    localNavigation: LocalNavigationState
    editor: EditorState,
    commandConsole: CommandConsoleState
} & UserInterfaceState>

persist.register({
  namespace: "ui",
  fileName: "ui.json",
  setStateAction: "setState",
  ignore: ["SET_STATE"],
  reviver: (s: PersistedUserInterfaceState) => {
    /*
        * These are intentionally written verbose. Smaller granular checks
        * let us catch more edge cases. We need to assume that the JSON
        * file may have been modified.
        */

    s.globalNavigation ??= {};
    s.globalNavigation ??= {};
    s.globalNavigation.notebooks ??= {};
    s.globalNavigation.notebooks.input = {};
    s.globalNavigation.tags ??= {};
    s.globalNavigation.tags.input = {};

    s.localNavigation ??= {};
    s.localNavigation.notes ??= {};
    s.localNavigation.notes.input = {};

    s.editor ??= {};
    s.editor.mode ??= "readonly";
    s.editor.tabs ??= {};
    s.editor.tabs.values ??= [];

    return s;
  },
  transformer: (s: PersistedUserInterfaceState) => {
    if (s.globalNavigation?.notebooks != null) {
      delete s.globalNavigation.notebooks.input;
      delete s.globalNavigation.notebooks.dragging;
    }

    if (s.globalNavigation?.tags != null) {
      delete s.globalNavigation.tags.input;
    }

    if (s.localNavigation?.notes != null) {
      delete s.localNavigation.notes.input;
    }

    delete s.cursor;
    delete s.commandConsole;

    if (s.editor != null) {
      if (s.editor.tabs != null) {
        delete s.editor.tabs.dragging;

        if (s.editor.tabs.values != null) {
          for (const tab of s.editor.tabs.values) {
            delete tab?.notebookDropdownVisible;
            delete tab?.tagDropdownVisible;
          }
        }
      }
    }

    return s;
  }
});

// After loading state from file, set the initial state of the undo contexts so we can revert
mediator.subscribe("ui/setState", (v) => {
  const { globalNavigation, localNavigation, editor } = v.payload;

  undo.getModule({ name: "globalNavigation" }).setInitialState(globalNavigation);
  undo.getModule({ name: "globalNavigation" }).setInitialState(localNavigation);
  undo.getModule({ name: "editor" }).setInitialState(editor);
});
