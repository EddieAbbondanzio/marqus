import { GlobalNavigationActions } from "@/store/modules/ui/modules/global-navigation/actions";
import { GlobalNavigationGetters } from "@/store/modules/ui/modules/global-navigation/getters";
import { GlobalNavigationMutations } from "@/store/modules/ui/modules/global-navigation/mutations";
import { GlobalNavigationState } from "@/store/modules/ui/modules/global-navigation/state";
import { RecursivePartial } from "@/utils";
import { undo } from "@/store/plugins/undo";
import { createComposable, Module } from "vuex-smart-module";
import { commands } from "@/utils/commands";
import { CreateTagCommand } from "@/utils/commands/global-navigation/create-tag-command";
import { RenameTagCommand } from "@/utils/commands/global-navigation/rename-tag-command";
import { DeleteTagCommand } from "@/utils/commands/global-navigation/delete-tag-command";
import { FocusCommand } from "@/utils/commands/global-navigation/focus-command";
import { ExpandAllCommand } from "@/utils/commands/global-navigation/expand-all-command";
import { CollapseAllCommand } from "@/utils/commands/global-navigation/collapse-all-command";
import { MoveSelectionUpCommand } from "@/utils/commands/global-navigation/move-selection-up-command";
import { MoveSelectionDownCommand } from "@/utils/commands/global-navigation/move-selection-down-command";
import { ScrolDownCommand } from "@/utils/commands/global-navigation/scroll-down-command";
import { ScrolUpCommand } from "@/utils/commands/global-navigation/scroll-up-command";
import { KeyCode, shortcuts } from "@/utils/shortcuts";

export const globalNavigation = new Module({
  namespaced: true,
  actions: GlobalNavigationActions,
  state: GlobalNavigationState,
  mutations: GlobalNavigationMutations,
  getters: GlobalNavigationGetters
});

export const useGlobalNavigation = createComposable(globalNavigation);

undo.registerContext({
  name: "globalNavigation",
  namespace: "ui/globalNavigation",
  setStateTransformer: (state: RecursivePartial<GlobalNavigationState>) => {
    // Nuke out visual state so we don't accidentally overwrite it.
    delete state.width;
    return state;
  }
});

export type GlobalNavigationCommand =
  | "focusGlobalNavigation"
  | "globalNavigationCreateTag"
  | "globalNavigationCreateNotebook"
  | "globalNavigationRenameTag"
  | "globalNavigationDeleteTag"
  | "globalNavigationExpandAll"
  | "globalNavigationCollapseAll"
  | "globalNavigationMoveSelectionUp"
  | "globalNavigationMoveSelectionDown"
  | "globalNavigationScrollDown"
  | "globalNavigationScrollUp";

export type GlobalNavigationShortcut =
| "focusGlobalNavigation"
| "globalNavigationCreateNotebook"
| "globalNavigationCreateTag"
| "globalNavigationCollapseAll"
| "globalNavigationExpandAll"

commands.register<GlobalNavigationCommand>({
  focusGlobalNavigation: FocusCommand,
  globalNavigationCollapseAll: CollapseAllCommand,
  globalNavigationCreateTag: CreateTagCommand,
  globalNavigationDeleteTag: DeleteTagCommand,
  globalNavigationExpandAll: ExpandAllCommand,
  globalNavigationMoveSelectionDown: MoveSelectionDownCommand,
  globalNavigationMoveSelectionUp: MoveSelectionUpCommand,
  globalNavigationRenameTag: RenameTagCommand,
  globalNavigationScrollDown: ScrolDownCommand,
  globalNavigationScrollUp: ScrolUpCommand
});

shortcuts.define<GlobalNavigationShortcut>({
  focusGlobalNavigation: [KeyCode.Control, KeyCode.Digit1],
  globalNavigationCreateNotebook: [KeyCode.Control, KeyCode.LetterN],
  globalNavigationCreateTag: [KeyCode.Control, KeyCode.LetterT],
  globalNavigationCollapseAll: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowUp],
  globalNavigationExpandAll: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowDown]
});

// Globals
shortcuts.map<GlobalNavigationShortcut, GlobalNavigationCommand>({
  focusGlobalNavigation: "focusGlobalNavigation"
});

// Contextuals
shortcuts.map<GlobalNavigationShortcut, GlobalNavigationCommand>({
  globalNavigationCollapseAll: "globalNavigationCollapseAll",
  globalNavigationCreateNotebook: "globalNavigationCreateNotebook",
  globalNavigationCreateTag: "globalNavigationCreateTag",
  globalNavigationExpandAll: "globalNavigationExpandAll",
  moveSelectionDown: "globalNavigationMoveSelectionDown",
  moveSelectionUp: "globalNavigationMoveSelectionUp",
  scrollDown: "globalNavigationScrollDown",
  scrollUp: "globalNavigationScrollUp"
}, { context: "globalNavigation" });
