import { Tag } from "../domain/tag";
import { PromptButton, PromptOptions } from "./promptUser";

/*
 * Helper types to define inputs and outputs of RPC handlers.
 */

export type In<I> = [I, Promise<void>];
export type InOut<I, O> = [I, Promise<O>];
export type Out<O> = [void, Promise<O>];

/*
 * TypeScript can't infer keys of a union type.
 * Don't break out RpcSchema into sub modules unless you
 * want to lose intellisense.
 */

export interface RpcSchema {
  // AppState
  // "appState.load": Out<AppState>;
  // "appState.save": InOut<AppState, AppState>;
  // Tags
  "tags.getAll": Out<Tag[]>;
  "tags.create": InOut<{ name: string }, Tag>;
  "tags.update": InOut<{ id: string; name: string }, Tag>;
  "tags.delete": In<{ id: string }>;
  // UI
  "ui.promptUser": InOut<PromptOptions, PromptButton>;
}

export type RpcType = keyof RpcSchema;

export type RpcInput<Type extends RpcType> = RpcSchema[Type][0];
export type RpcOutput<Type extends RpcType> = RpcSchema[Type][1];

export type Rpc = <Type extends RpcType>(
  // Allows for passing just the type ex: "tags.getAll" if no input expected
  ...params: RpcInput<Type> extends void ? [Type] : [Type, RpcInput<Type>]
) => Promise<RpcOutput<Type>>;

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
