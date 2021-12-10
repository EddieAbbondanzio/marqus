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
  "globalNavigation.updateScroll": Command<number>;
  "globalNavigation.resizeWidth": Command<string>;
  "globalNavigation.createTag": Command;
}
export type CommandType = keyof CommandSchema;

export type CommandsForNamespace<Namespace extends string> = Pick<
  CommandSchema,
  StartsWith<keyof CommandSchema, Namespace>
>;