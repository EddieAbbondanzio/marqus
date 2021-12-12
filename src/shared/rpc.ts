import { State, Tag, UI } from "./state";
import { PromptButton, PromptOptions } from "./prompt";
import { Coord } from "./dom";

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
  // All non ui state changes is performed via specific rpcs ex: tag.create...
  "state.saveUI": RpcIn<UI>;
  // Tags
  "tags.getAll": RpcOut<Tag[]>;
  "tags.create": RpcInOut<{ name: string }, Tag>;
  "tags.update": RpcInOut<{ id: string; newName: string }, Tag>;
  "tags.delete": RpcIn<{ id: string }>;
  // App
  "app.promptUser": RpcInOut<PromptOptions, PromptButton>;
  "app.openDevTools": RpcVoid;
  "app.inspectElement": RpcIn<Coord>;
  "app.reload": RpcVoid;
  "app.toggleFullScreen": RpcVoid;
  "app.quit": RpcVoid;
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
