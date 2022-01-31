import { PromptButton, PromptOptions } from "./prompt";
import { Coord } from "./dom";
import { UI } from "./domain/state";
import { Shortcut } from "./domain/shortcut";
import { StartsWith } from "../renderer/types";
import { Note } from "./domain/note";
import { Notebook } from "./domain/notebook";
import { Tag } from "./domain/tag";

/*
 * Helper types to define inputs and outputs of RPC handlers.
 */

export type RpcIn<I> = [I, Promise<void>];
export type RpcInOut<I, O> = [I, Promise<O>];
export type RpcOut<O> = [void, Promise<O>];
export type RpcVoid = [void, void];

/*
 * TypeScript can't infer keys of a union type.
 * Don't break out RpcSchema into sub modules unless you
 * want to lose intellisense.
 */
export interface RpcSchema {
  // App
  "app.promptUser": RpcInOut<PromptOptions, PromptButton>;
  "app.openDevTools": RpcVoid;
  "app.inspectElement": RpcIn<Coord>;
  "app.reload": RpcVoid;
  "app.toggleFullScreen": RpcVoid;
  "app.quit": RpcVoid;
  "app.loadPreviousUIState": RpcOut<UI>;
  "app.saveUIState": RpcIn<UI>;

  // Shortcuts
  "shortcuts.getAll": RpcOut<Shortcut[]>;

  // Tags
  "tags.getAll": RpcOut<Tag[]>;
  "tags.create": RpcInOut<{ name: string }, Tag>;
  "tags.update": RpcInOut<{ id: string; name: string }, Tag>;
  "tags.delete": RpcIn<{ id: string }>;

  // Notebooks
  "notebooks.getAll": RpcOut<Notebook[]>;
  "notebooks.create": RpcInOut<{ name: string; parentId?: string }, Notebook>;
  "notebooks.update": RpcInOut<{ id: string; name: string }, Notebook>;
  "notebooks.delete": RpcIn<{ id: string }>;

  // Notes
  "notes.getAll": RpcOut<Note[]>;
  "notes.create": RpcInOut<
    { name: string; tag?: string; notebook?: string },
    Note
  >;
  "notes.update": RpcInOut<{ id: string; name: string }, Note>;
}

export type RpcType = keyof RpcSchema;

export type RpcInput<Type extends RpcType> = RpcSchema[Type][0];
export type RpcOutput<Type extends RpcType> = RpcSchema[Type][1];

export type Rpc = <Type extends RpcType>(
  // Allows for passing just the type ex: "tags.getAll" if no input expected
  ...params: RpcInput<Type> extends void ? [Type] : [Type, RpcInput<Type>]
) => RpcOutput<Type>;

/**
 * Used internally by rpc by both the main and renderer side.
 */
export type RpcArgument = {
  id: string;
  type: RpcType;
  value: RpcSchema[RpcType];
};

/**
 * Handler that implements a specific RPC action. These should only be
 * defined on the main thread.
 */
export type RpcHandler<Type extends RpcType> = (
  input: RpcInput<Type>
) => RpcOutput<Type>;

/**
 * Registry for defining multiple RPC handlers.
 */
export type RpcNamespace<Namespace extends string> = Pick<
  RpcSchema,
  StartsWith<keyof RpcSchema, Namespace>
>;

export type RpcRegistry<Namespace extends string> = {
  [Key in StartsWith<keyof RpcSchema, Namespace>]: RpcHandler<Key>;
};
