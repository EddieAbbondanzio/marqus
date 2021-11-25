import { State, Tag } from "./domain";
import { ContextMenu, ContextMenuItem } from "./ui/contextMenu";
import { PromptButton, PromptOptions } from "./ui/promptUser";

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
  // AppState
  "state.load": RpcOut<State>;
  "state.save": RpcIn<State>;
  // Tags
  "tags.getAll": RpcOut<Tag[]>;
  "tags.create": RpcInOut<{ name: string }, Tag>;
  "tags.update": RpcInOut<{ id: string; name: string }, Tag>;
  "tags.delete": RpcIn<{ id: string }>;
  // UI
  "ui.promptUser": RpcInOut<PromptOptions, PromptButton>;
  "ui.openDevTools": RpcVoid;
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
