import { Coord } from "../../../shared/dom";
import { Tag, Notebook } from "../../../shared/domain/entities";
import { ExplorerView, State, UI } from "../../../shared/domain/state";
import { Shortcut } from "../../../shared/domain/valueObjects";
import { StartsWith } from "../../types";
import { DeepPartial } from "tsdef";

// NB: Don't pull this into index.ts unless you want circular dependencies

export type Transformer<S> = (previous: S) => S;
export type PartialTransformer<S> = (previous: S) => DeepPartial<S>;

/**
 * SetUI supportes partial updates since it's unlikely we'll want to update
 * every single property at once. This also works for nested props.
 */
export type SetUI = (t: PartialTransformer<UI> | DeepPartial<UI>) => void;
export type SetTags = (t: Transformer<Tag[]>) => void;
export type SetNotebooks = (t: Transformer<Notebook[]>) => void;
export type SetShortcuts = (t: Transformer<Shortcut[]>) => void;

// Context implementation lives in src/renderer/commands/index.ts
export interface ExecutionContext {
  getState: () => State;
  setUI: SetUI;
  setTags: SetTags;
  setNotebooks: SetNotebooks;
  setShortcuts: SetShortcuts;
}

export type Command<Input = void> = (
  context: ExecutionContext,
  // Payload is optional to support running as a shortcut
  payload?: Input
) => Promise<void>;

export interface CommandSchema {
  "app.openDevTools": Command;
  "app.reload": Command;
  "app.toggleFullScreen": Command;
  "app.inspectElement": Command<Coord>;
  "sidebar.focus": Command;
  "sidebar.toggle": Command;
  "sidebar.updateScroll": Command<number>;
  "sidebar.scrollDown": Command;
  "sidebar.scrollUp": Command;
  "sidebar.resizeWidth": Command<string>;
  "sidebar.toggleFilter": Command;
  "sidebar.createTag": Command;
  "sidebar.updateTag": Command<string>;
  "sidebar.deleteTag": Command<string>;
  "sidebar.setSelection": Command<string>;
  "sidebar.moveSelectionUp": Command;
  "sidebar.moveSelectionDown": Command;
  "sidebar.setExplorerView": Command<ExplorerView>;
}
export type CommandType = keyof CommandSchema;
export type CommandInput<Command extends CommandType> = Parameters<
  CommandSchema[Command]
>[1];

export type CommandsForNamespace<Namespace extends string> = Pick<
  CommandSchema,
  StartsWith<keyof CommandSchema, Namespace>
>;
