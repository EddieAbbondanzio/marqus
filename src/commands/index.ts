/* eslint-disable no-useless-constructor */
import { Command } from "./command";
import {
  FocusCommand, CollapseAllCommand,
  CreateTagCommand, DeleteTagCommand, ExpandAllCommand, MoveSelectionDownCommand,
  MoveSelectionUpCommand, RenameTagCommand, ScrolDownCommand, ScrolUpCommand,
  CreateNotebookCommand, RenameNotebookCommand, DeleteAllTagsCommand,
  DeleteNotebookCommand, DeleteAllNotebooksCommand, EmptyTrashCommand
} from "./global-navigation";

const COMMANDS = {
  globalNavigationFocus: FocusCommand,
  globalNavigationExpandAll: ExpandAllCommand,
  globalNavigationCollapseAll: CollapseAllCommand,
  globalNavigationCreateTag: CreateTagCommand,
  globalNavigationRenameTag: RenameTagCommand,
  globalNavigationDeleteTag: DeleteTagCommand,
  globalNavigationDeleteAllTags: DeleteAllTagsCommand,
  globalNavigationCreateNotebook: CreateNotebookCommand,
  globalNavigationRenameNotebook: RenameNotebookCommand,
  globalNavigationDeleteNotebook: DeleteNotebookCommand,
  globalNavigationDeleteAllNotebooks: DeleteAllNotebooksCommand,
  globalNavigationMoveSelectionUp: MoveSelectionUpCommand,
  globalNavigationMoveSelectionDown: MoveSelectionDownCommand,
  globalNavigationScrollUp: ScrolUpCommand,
  globalNavigationScrollDown: ScrolDownCommand,
  globalNavigationEmptyTrash: EmptyTrashCommand
};

export type CommandRegistry = typeof COMMANDS;

export type CommandName = keyof CommandRegistry;

export type CommandInput<T> = T extends Command<infer X> ? X : void

export function generate(registry: CommandRegistry) {
  /*
   * Here be dragons
   */

  async function run<C extends keyof CommandRegistry>(
    name: C, payload?: CommandInput<CommandRegistry[C]["prototype"]>
  ): Promise<void> {
    const ctor = registry[name];

    if (ctor == null) {
      throw Error(`No command ${name} registered.`);
    }

    // eslint-disable-next-line new-cap
    const command = new (ctor as any)();
    await command.execute(payload);
  }

  return {
    run
  };
}

export const commands = generate(COMMANDS);
