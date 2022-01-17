import { PromptButton, PromptOptions } from "./prompt";
import { Coord } from "./dom";
import { NoteFlag, Tag } from "./domain/entities";
import { App } from "./domain/app";
import { NoteGroup, NoteMetadata, Shortcut } from "./domain/valueObjects";

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
  "app.loadPreviousState": RpcOut<App>;
  "app.saveState": RpcIn<App>;

  // Shortcuts
  "shortcuts.getAll": RpcOut<Shortcut[]>;

  // Tags
  "tags.getAll": RpcOut<Tag[]>;
  "tags.create": RpcInOut<{ name: string }, Tag>;
  "tags.update": RpcInOut<{ id: string; name: string }, Tag>;
  "tags.delete": RpcIn<{ id: string }>;

  // Notes
  "notes.getAll": RpcInOut<
    { groupBy?: "tag" | "notebook"; where?: { flags: NoteFlag } },
    Array<NoteMetadata | NoteGroup>
  >;
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
export type RpcRegistry = Partial<{
  [key in RpcType]: RpcHandler<key>;
}>;
