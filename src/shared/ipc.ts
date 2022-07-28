import { PromptButton, PromptOptions } from "./ui/prompt";
import { Shortcut } from "./domain/shortcut";
import { Note } from "./domain/note";
import { Config } from "./domain/config";
import { IpcMain, IpcMainInvokeEvent, Point } from "electron";
import { Menu } from "./ui/menu";
import { AppState } from "./ui/app";

export const IPCS = [
  "app.setApplicationMenu",
  "app.showContextMenu",
  "app.promptUser",
  "app.openDevTools",
  "app.inspectElement",
  "app.reload",
  "app.toggleFullScreen",
  "app.quit",
  "app.loadPreviousUIState",
  "app.saveUIState",
  "app.openInWebBrowser",

  "shortcuts.getAll",

  "notes.getAll",
  "notes.create",
  "notes.updateMetadata",
  "notes.loadContent",
  "notes.saveContent",
  "notes.delete",
  "notes.moveToTrash",

  "config.hasDataDirectory",
  "config.selectDataDirectory",
  "config.openDataDirectory",
] as const;

export type IpcType = typeof IPCS[number];

export interface IpcSchema extends Record<IpcType, (...params: any[]) => any> {
  // App
  "app.setApplicationMenu"(menus: Menu[]): Promise<void>;
  "app.showContextMenu"(menus: Menu[]): Promise<void>;
  "app.promptUser"<T>(options: PromptOptions<T>): Promise<PromptButton<T>>;
  "app.openDevTools"(): Promise<void>;
  "app.inspectElement"(point: Point): Promise<void>;
  "app.reload"(): Promise<void>;
  "app.toggleFullScreen"(): Promise<void>;
  "app.quit"(): Promise<void>;
  "app.loadPreviousUIState"(): Promise<AppState>;
  "app.saveUIState"(ui: AppState): Promise<void>;
  "app.openInWebBrowser"(url: string): Promise<void>;

  // Shortcuts
  "shortcuts.getAll"(): Promise<Shortcut[]>;

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

export type Ipc = <T extends IpcType, I extends Parameters<IpcSchema[T]>>(
  type: T,
  ...params: I extends void ? [] : I
) => ReturnType<IpcSchema[T]>;

// Wrap IpcMain to add type safety + make it easy to test.
// This comes off like a code smell but I like how hands off of an approach it is
// and it also keeps the amount of boilerplate code low.
export interface IpcMainTS extends Pick<IpcMain, "listeners"> {
  handle<Type extends IpcType>(
    type: Type,
    handler: (
      event: IpcMainInvokeEvent,
      ...params: Parameters<IpcSchema[Type]>
    ) => ReturnType<IpcSchema[Type]>
  ): void;
  on(event: "init", callback: () => Promise<void>): void;
}

export type IpcPlugin<Repo = undefined> = (
  ipc: IpcMainTS,
  config: Config,
  repo?: Repo
) => void;

export enum IpcChannel {
  ApplicationMenuClick = "applicationmenuclick",
  ContextMenuClick = "contextmenuclick",
}
