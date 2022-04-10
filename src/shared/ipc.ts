import { PromptButton, PromptOptions } from "./prompt";
import { Coord } from "../renderer/utils/dom";
import { UI } from "./domain/ui";
import { Shortcut } from "./domain/shortcut";
import { StartsWith } from "../renderer/types";
import { Note } from "./domain/note";
import { Tag } from "./domain/tag";

/*
 * Helper types to define inputs and outputs of IPC handlers.
 */

export type IpcIn<I> = [I, Promise<void>];
export type IpcInOut<I, O> = [I, Promise<O>];
export type IpcOut<O> = [void, Promise<O>];
export type IpcVoid = [void, void];

/*
 * TypeScript can't infer keys of a union type. Don't break out IpcSchema
 * into sub modules unless you want to lose intellisense.
 */
export interface IpcSchema {
  // App
  "app.promptUser": IpcInOut<PromptOptions, PromptButton>;
  "app.openDevTools": IpcVoid;
  "app.inspectElement": IpcIn<Coord>;
  "app.reload": IpcVoid;
  "app.toggleFullScreen": IpcVoid;
  "app.quit": IpcVoid;
  "app.loadPreviousUIState": IpcOut<UI>;
  "app.saveUIState": IpcIn<UI>;

  // Shortcuts
  "shortcuts.getAll": IpcOut<Shortcut[]>;

  // Tags
  "tags.getAll": IpcOut<Tag[]>;
  "tags.create": IpcInOut<{ name: string }, Tag>;
  "tags.rename": IpcInOut<{ id: string; name: string }, Tag>;
  "tags.delete": IpcIn<{ id: string }>;

  // Notes
  "notes.getAll": IpcOut<Note[]>;
  "notes.create": IpcInOut<{ name: string; parent?: string }, Note>;
  "notes.updateMetadata": IpcInOut<Partial<Note> & { id: string }, Note>;
  "notes.loadContent": IpcInOut<string, string | null>;
  "notes.saveContent": IpcIn<{ id: string; content: string }>;
  "notes.delete": IpcIn<{ id: string }>;

  // Config
  "config.hasDataDirectory": IpcOut<boolean>;
  "config.selectDataDirectory": IpcVoid;
}

export type IpcType = keyof IpcSchema;

export type IpcInput<Type extends IpcType> = IpcSchema[Type][0];
export type IpcOutput<Type extends IpcType> = IpcSchema[Type][1];

export type Ipc = <Type extends IpcType>(
  // Allows for passing just the type ex: "tags.getAll" if no input expected
  ...params: IpcInput<Type> extends void ? [Type] : [Type, IpcInput<Type>]
) => IpcOutput<Type>;

/**
 * Handler that implements a specific IPC action. These should only be
 * defined on the main thread.
 */
export type IpcHandler<Type extends IpcType> = (
  input: IpcInput<Type>
) => IpcOutput<Type>;

/**
 * Registry for defining multiple IPC handlers.
 */
export type IpcNamespace<Namespace extends string> = Pick<
  IpcSchema,
  StartsWith<keyof IpcSchema, Namespace>
>;

export type IpcRegistry<Namespace extends string> = {
  [Key in StartsWith<keyof IpcSchema, Namespace>]: IpcHandler<Key>;
};
