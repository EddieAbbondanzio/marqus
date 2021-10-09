import { mediator } from "@/store/plugins/mediator";
import { persist } from "@/store/plugins/persist";
import { undo } from "@/store/plugins/undo";
import { RecursivePartial } from "@/utils";
import { CommandConsoleState } from "./modules/commandConsole/state";
import { EditorState } from "./modules/editor/state";
import { GlobalNavigationState } from "./modules/globalNavigation/state";
import { LocalNavigationState } from "./modules/localNavigation/state";
import { UserInterfaceState } from "./state";

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
