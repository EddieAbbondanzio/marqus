import { PromptButton, PromptOptions } from "./prompt";
import { Coord } from "./dom";
import { ApplicationMenu, UI } from "./domain/ui";
import { Shortcut } from "./domain/shortcut";
import { Note } from "./domain/note";
import { Tag } from "./domain/tag";
import { Config } from "./domain/config";

export interface IpcInvokeSchema {
  /*
   * TypeScript can't infer keys of a union type. Don't break out IpcSchema
   * into sub modules unless you want to lose intellisense.
   */

  // App
  "app.setApplicationMenu": IpcInOut<
    ApplicationMenu[],
    { event: string; eventInput: unknown }
  >;
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
export type InvokeType = keyof IpcInvokeSchema;

// Helper types to define inputs and outputs of IPC handlers.
export type IpcIn<I> = [I, Promise<void>];
export type IpcInOut<I, O> = [I, Promise<O>];
export type IpcOut<O> = [void, Promise<O>];
export type IpcVoid = [void, void];

export interface IpcRendererTS {
  invoke: Invoker;
  // Only use _on and _send in special cases.
  _on: Electron.IpcRenderer["on"];
  _off: Electron.IpcRenderer["off"];
  _send: Electron.IpcRenderer["send"];
}

export type Invoker = <Type extends InvokeType>(
  // Allows for passing just the type ex: "tags.getAll" if no input expected
  ...params: InvokeInput<Type> extends void ? [Type] : [Type, InvokeInput<Type>]
) => InvokeOutput<Type>;

export type InvokeInput<Type extends InvokeType> = IpcInvokeSchema[Type][0];
export type InvokeOutput<Type extends InvokeType> = IpcInvokeSchema[Type][1];

// Basic wrapper for intellisense and easy testing support
export interface IpcMainTS {
  handle<Type extends InvokeType>(
    type: Type,
    handler: InvokeHandler<Type>
  ): void;
}
export type InvokeHandler<Type extends InvokeType> = (
  input: InvokeInput<Type>
) => InvokeOutput<Type>;

export type IpcPlugin = (ipc: IpcMainTS, config: Config) => void;
