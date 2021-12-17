import { Coord } from "../../../shared/dom";
import {
  Note,
  Notebook,
  Shortcut,
  State,
  Tag,
  UI,
} from "../../../shared/state";
import { StartsWith } from "../../types";

export type Transformer<S> = (previous: S) => S;

export type SetUI = (t: Transformer<UI>) => void;
export type SetTags = (t: Transformer<Tag[]>) => void;
export type SetNotebooks = (t: Transformer<Notebook[]>) => void;
export type SetShortcuts = (t: Transformer<Shortcut[]>) => void;

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
  "globalNavigation.focus": Command;
  "globalNavigation.updateScroll": Command<number>;
  "globalNavigation.resizeWidth": Command<string>;
  "globalNavigation.createTag": Command;
  "globalNavigation.updateTag": Command<string>;
  "globalNavigation.deleteTag": Command<string>;
  "globalNavigation.setSelected": Command<string>;
}
export type CommandType = keyof CommandSchema;
export type CommandInput<Command extends CommandType> = Parameters<
  CommandSchema[Command]
>[1];

export type CommandsForNamespace<Namespace extends string> = Pick<
  CommandSchema,
  StartsWith<keyof CommandSchema, Namespace>
>;
