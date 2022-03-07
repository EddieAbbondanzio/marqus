import { PromptButton, PromptOptions } from "./prompt";
import { Coord } from "./dom";
import { UI } from "./domain/state";
import { Shortcut } from "./domain/shortcut";
import { StartsWith } from "../renderer/types";
import { Note } from "./domain/note";
import { Notebook } from "./domain/notebook";
import { Tag } from "./domain/tag";
import { Config } from "./domain/config";

/*
 * Helper types to define inputs and outputs of RPC handlers.
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

  // Notebooks
  "notebooks.getAll": IpcOut<Notebook[]>;
  "notebooks.create": IpcInOut<{ name: string; parentId?: string }, Notebook>;
  "notebooks.rename": IpcInOut<
    { id: string; name: string; parentId?: string },
    Notebook
  >;
  "notebooks.delete": IpcIn<{ id: string }>;

  // Notes
  "notes.getAll": IpcOut<Note[]>;
  "notes.create": IpcInOut<
    { name: string; tag?: string; notebook?: string },
    Note
  >;
  "notes.rename": IpcInOut<{ id: string; name: string }, Note>;
  "notes.loadContent": IpcInOut<string, string | null>;
  "notes.saveContent": IpcIn<{ id: string; content: string }>;

  // Config
  "config.load": IpcOut<Config | null>;
  "config.setDataDirectory": IpcIn<string>;
}

export type IpcType = keyof IpcSchema;

export type IpcInput<Type extends IpcType> = IpcSchema[Type][0];
export type IpcOutput<Type extends IpcType> = IpcSchema[Type][1];

export type Ipc = <Type extends IpcType>(
  // Allows for passing just the type ex: "tags.getAll" if no input expected
  ...params: IpcInput<Type> extends void ? [Type] : [Type, IpcInput<Type>]
) => IpcOutput<Type>;

/**
 * Used internally by rpc by both the main and renderer side.
 */
export type IpcArgument = {
  id: string;
  // TODO: Can we make this type better. value relies on type prop
  type: IpcType;
  value: IpcSchema[IpcType];
};

/**
 * Handler that implements a specific RPC action. These should only be
 * defined on the main thread.
 */
export type IpcHandler<Type extends IpcType> = (
  input: IpcInput<Type>
) => IpcOutput<Type>;

/**
 * Registry for defining multiple RPC handlers.
 */
export type IpcNamespace<Namespace extends string> = Pick<
  IpcSchema,
  StartsWith<keyof IpcSchema, Namespace>
>;

export type IpcRegistry<Namespace extends string> = {
  [Key in StartsWith<keyof IpcSchema, Namespace>]: IpcHandler<Key>;
};
