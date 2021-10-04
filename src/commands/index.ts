/* eslint-disable no-useless-constructor */
import { Command } from "./command";
import { HideCommandConsole, ToggleCommandConsole } from "./command-console";
import {
  Focus, CollapseAll,
  CreateTag, DeleteTag, ExpandAll, MoveSelectionDown,
  MoveSelectionUp, RenameTag, ScrolDown, ScrolUp,
  CreateNotebook, RenameNotebook, DeleteAllTags,
  DeleteNotebook, DeleteAllNotebooks, EmptyTrash
} from "./global-navigation";

export const COMMANDS = {
  globalNavigationFocus: Focus,
  globalNavigationExpandAll: ExpandAll,
  globalNavigationCollapseAll: CollapseAll,
  globalNavigationCreateTag: CreateTag,
  globalNavigationRenameTag: RenameTag,
  globalNavigationDeleteTag: DeleteTag,
  globalNavigationDeleteAllTags: DeleteAllTags,
  globalNavigationCreateNotebook: CreateNotebook,
  globalNavigationRenameNotebook: RenameNotebook,
  globalNavigationDeleteNotebook: DeleteNotebook,
  globalNavigationDeleteAllNotebooks: DeleteAllNotebooks,
  globalNavigationMoveSelectionUp: MoveSelectionUp,
  globalNavigationMoveSelectionDown: MoveSelectionDown,
  globalNavigationScrollUp: ScrolUp,
  globalNavigationScrollDown: ScrolDown,
  globalNavigationEmptyTrash: EmptyTrash,
  consoleToggle: ToggleCommandConsole,
  consoleHide: HideCommandConsole
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
      console.log(registry);
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

export function isCommandName(name: string):name is CommandName {
  return Object.keys(COMMANDS).some(c => c === name);
}
