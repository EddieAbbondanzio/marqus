/* eslint-disable no-useless-constructor */
import {
  FocusCommand, CollapseAllCommand,
  CreateTagCommand, DeleteTagCommand, ExpandAllCommand, MoveSelectionDownCommand,
  MoveSelectionUpCommand, RenameTagCommand, ScrolDownCommand, ScrolUpCommand
} from "./global-navigation";

export abstract class Command<TInput> {
  abstract execute(payload: TInput): Promise<void>;
}

const COMMANDS = {
  globalNavigationFocus: FocusCommand,
  globalNavigationCollapseAll: CollapseAllCommand,
  globalNavigationCreateTag: CreateTagCommand,
  globalNavigationDeleteTag: DeleteTagCommand,
  globalNavigationExpandAll: ExpandAllCommand,
  globalNavigationMoveSelectionDown: MoveSelectionDownCommand,
  globalNavigationMoveSelectionUp: MoveSelectionUpCommand,
  globalNavigationRenameTag: RenameTagCommand,
  globalNavigationScrollDown: ScrolDownCommand,
  globalNavigationScrollUp: ScrolUpCommand
};

export type CommandRegistry = typeof COMMANDS;

export type CommandName = keyof CommandRegistry;

export type CommandInput<T> = T extends Command<infer X> ? X : void

export function generate(registry: CommandRegistry) {
  /*
   * Here be dragons
   */

  return {
    /**
     * Run a command via the name it's registered under.
     * @param name The registered name of the command.
     * @param payload Input to pass the command
     */
    async run<C extends keyof CommandRegistry>(name: C, payload: CommandInput<CommandRegistry[C]["prototype"]>) {
      const ctor = registry[name];

      if (ctor == null) {
        throw Error(`No command ${name} registered.`);
      }

      // eslint-disable-next-line new-cap
      const command = new (ctor as any)();
      await command.execute(payload);
    }
  };
}

export const commands = generate(COMMANDS);
