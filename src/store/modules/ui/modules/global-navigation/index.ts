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

export enum GlobalNavigationCommand {
  Focus = "focusGlobalNavigation",
  CreateTag = "globalNavigationCreateTag",
  RenameTag = "globalNavigationRenameTag",
  DeleteTag = "globalNavigationDeleteTag",
  ExpandAll = "globalNavigationExpandAll",
  CollapseAll = "globalNavigationCollapseAll",
  MoveSelectionUp = "globalNavigationMoveSelectionUp",
  MoveSelectionDown = "globalNavigationMoveSelectionDown",
  ScrollDown = "globalNavigationScrollDown",
  ScrollUp = "globalNavigationScrollUp",
}

commands.register(GlobalNavigationCommand.CreateTag, CreateTagCommand);
commands.register(GlobalNavigationCommand.RenameTag, RenameTagCommand);
commands.register(GlobalNavigationCommand.DeleteTag, DeleteTagCommand);
commands.register(GlobalNavigationCommand.Focus, FocusCommand);
commands.register(GlobalNavigationCommand.ExpandAll, ExpandAllCommand);
commands.register(GlobalNavigationCommand.CollapseAll, CollapseAllCommand);
commands.register(GlobalNavigationCommand.MoveSelectionUp, MoveSelectionUpCommand);
commands.register(GlobalNavigationCommand.MoveSelectionDown, MoveSelectionDownCommand);
commands.register(GlobalNavigationCommand.ScrollDown, ScrolDownCommand);
commands.register(GlobalNavigationCommand.ScrollUp, ScrolUpCommand);
