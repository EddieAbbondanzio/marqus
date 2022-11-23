import { PromptButton, PromptOptions } from "./ui/prompt";
import { Shortcut } from "./domain/shortcut";
import { Note, NoteSort } from "./domain/note";
import { IpcMain, IpcMainInvokeEvent, Point } from "electron";
import { Menu } from "./ui/menu";
import { AppState, SerializedAppState } from "./ui/app";

export const IPCS = [
  "app.setApplicationMenu",
  "app.showContextMenu",
  "app.promptUser",
  "app.openDevTools",
  "app.inspectElement",
  "app.reload",
  "app.toggleFullScreen",
  "app.quit",
  "app.loadAppState",
  "app.saveAppState",
  "app.openInWebBrowser",
  "app.openLogDirectory",

  "shortcuts.getAll",

  "notes.getAll",
  "notes.create",
  "notes.update",
  "notes.delete",
  "notes.moveToTrash",

  "config.get",
  "config.openInTextEditor",
  "config.selectDataDirectory",
  "config.openDataDirectory",

  "log.info",
  "log.debug",
  "log.warn",
  "log.error",
] as const;

export type IpcType = typeof IPCS[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  "app.loadAppState"(): Promise<SerializedAppState>;
  "app.saveAppState"(ui: SerializedAppState): Promise<void>;
  "app.openInWebBrowser"(url: string): Promise<void>;
  "app.openLogDirectory"(): Promise<void>;

  // Shortcuts
  "shortcuts.getAll"(): Promise<Shortcut[]>;

  // Notes
  "notes.getAll"(): Promise<Note[]>;
  "notes.create"(params: NoteCreateParams): Promise<Note>;
  "notes.update"(id: string, params: NoteUpdateParams): Promise<void>;
  "notes.delete"(id: string): Promise<void>;
  "notes.moveToTrash"(id: string): Promise<void>;

  // Config
  "config.openInTextEditor"(): Promise<void>;
  "config.selectDataDirectory"(): Promise<void>;
  "config.openDataDirectory"(): Promise<void>;

  // Logging
  "log.info"(message: string): Promise<void>;
  "log.debug"(message: string): Promise<void>;
  "log.warn"(message: string): Promise<void>;
  "log.error"(message: string, err?: Error): Promise<void>;
}

export type NoteCreateParams = Pick<Note, "name"> & { parent?: Note["id"] };
export type NoteUpdateParams = Partial<
  Pick<Note, "name" | "sort" | "parent" | "content">
>;

export type Ipc = <T extends IpcType, I extends Parameters<IpcSchema[T]>>(
  type: T,
  ...params: I extends void ? [] : I
) => ReturnType<IpcSchema[T]>;

export type IpcEvent = "init";

// Wrap IpcMain to add type safety + make it easy to test.
// This comes off like a code smell but I like how hands off of an approach it is
// and it also keeps the amount of boilerplate code low.
export interface IpcMainTS extends Pick<IpcMain, "listeners"> {
  handle<Type extends IpcType>(
    type: Type,
    handler: (
      event: IpcMainInvokeEvent,
      ...params: Parameters<IpcSchema[Type]>
    ) => ReturnType<IpcSchema[Type]>,
  ): void;
  on(event: IpcEvent, callback: () => Promise<void>): void;
}

export enum IpcChannel {
  ApplicationMenuClick = "applicationmenuclick",
  ContextMenuClick = "contextmenuclick",
}
