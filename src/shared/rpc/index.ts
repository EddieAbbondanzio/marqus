import { Tag } from "../domain/tag";
import { Config, LoadConfig, SaveConfig } from "./config";
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
  // Tags
  "tags.getAll": Out<Tag[]>;
  "tags.create": InOut<{ name: string }, Tag>;
  "tags.update": InOut<{ id: string; name: string }, Tag>;
  "tags.delete": In<{ id: string }>;
  // Config
  "config.load": InOut<LoadConfig, Config>;
  "config.save": InOut<SaveConfig, Config>;
  // UI
  "ui.promptUser": InOut<PromptOptions, PromptButton>;
}

export type RpcType = keyof RpcSchema;

export type Rpc = <Type extends RpcType>(
  type: Type,
  value: RpcSchema[Type][0]
) => Promise<RpcSchema[Type][1]>;

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
  input: RpcSchema[Type][0]
) => RpcSchema[Type][1];

/**
 * Registry for defining multiple RPC handlers.
 */
export type RpcRegistry = Partial<{
  [key in RpcType]: RpcHandler<key>;
}>;
