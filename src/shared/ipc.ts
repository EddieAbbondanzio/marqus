import { PromptButton, PromptOptions } from "./prompt";
import { Menu, UI } from "./domain/ui";
import { Shortcut } from "./domain/shortcut";
import { Note } from "./domain/note";
import { Tag } from "./domain/tag";
import { Config } from "./domain/config";
import { Point } from "electron";

export interface IpcSchema {
  // App
  "app.setApplicationMenu"(menus: Menu[]): Promise<void>;
  "app.showContextMenu"(menus: Menu[]): Promise<void>;
  "app.promptUser"<T>(options: PromptOptions<T>): Promise<PromptButton<T>>;
  "app.openDevTools"(): Promise<void>;
  "app.inspectElement"(point: Point): Promise<void>;
  "app.reload"(): Promise<void>;
  "app.toggleFullScreen"(): Promise<void>;
  "app.quit"(): Promise<void>;
  "app.loadPreviousUIState"(): Promise<UI>;
  "app.saveUIState"(ui: UI): Promise<void>;
  "app.openInWebBrowser"(url: string): Promise<void>;

  // Shortcuts
  "shortcuts.getAll"(): Promise<Shortcut[]>;

  // Tags
  "tags.getAll"(): Promise<Tag[]>;
  "tags.create"(name: string): Promise<Tag>;
  "tags.rename"(id: string, name: string): Promise<Tag>;
  "tags.delete"(id: string): Promise<void>;

  // Notes
  "notes.getAll"(): Promise<Note[]>;
  "notes.create"(name: string, parent?: string): Promise<Note>;
  "notes.updateMetadata"(id: string, props: Partial<Note>): Promise<Note>;
  "notes.loadContent"(id: string): Promise<string | null>;
  "notes.saveContent"(id: string, content: string): Promise<void>;
  "notes.delete"(id: string): Promise<void>;
  "notes.moveToTrash"(id: string): Promise<void>;

  // Config
  "config.hasDataDirectory"(): Promise<boolean>;
  "config.selectDataDirectory"(): Promise<void>;
  "config.openDataDirectory"(): Promise<void>;
}

export type IpcType = keyof IpcSchema;
export type Ipc = <T extends IpcType, I extends Parameters<IpcSchema[T]>>(
  type: T,
  ...params: I extends void ? [] : I
) => ReturnType<IpcSchema[T]>;

// Basic wrapper for intellisense and easy testing support
export interface IpcMainTS {
  handle<Type extends IpcType>(
    type: Type,
    handler: (
      ...params: Parameters<IpcSchema[Type]>
    ) => ReturnType<IpcSchema[Type]>
  ): void;
}

export type IpcPlugin = (ipc: IpcMainTS, config: Config) => void;

export enum IpcChannels {
  ApplicationMenuClick = "applicationmenuclick",
  ContextMenuClick = "contextmenuclick",
}
