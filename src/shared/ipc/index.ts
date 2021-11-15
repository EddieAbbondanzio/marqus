import { Tag } from "../domain/tag";
import { Config, LoadConfig, SaveConfig } from "./config";
import { PromptButton, PromptOptions } from "./promptUser";

export type In<I> = [I, Promise<void>];
export type InOut<I, O> = [I, Promise<O>];
export type Out<O> = [void, Promise<O>];

/*
 * TypeScript can't infer keys of a union type.
 * Don't break out IpcSchema into sub modules unless you
 * want to lose intellisense.
 */

export interface IpcSchema {
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

export type IpcType = keyof IpcSchema;

export type SendIpc = <Type extends IpcType>(
  type: Type,
  value: IpcSchema[Type][0]
) => Promise<IpcSchema[Type][1]>;

export type IpcHandler<I = unknown> = (arg: I) => Promise<any>;

export type IpcArgument = {
  id: string;
  type: IpcType;
  value: IpcSchema[IpcType];
};
