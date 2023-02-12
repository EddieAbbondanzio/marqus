import { PromptButton, PromptOptions } from "./ui/prompt";
import { Shortcut } from "./domain/shortcut";
import { Note } from "./domain/note";
import { Point } from "electron";
import { Menu } from "./ui/menu";
import { SerializedAppState } from "./ui/appState";
import { Attachment, FileInfo } from "./domain/protocols";

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
  "app.toggleAutoHideAppMenu",

  "shortcuts.getAll",

  "notes.getAll",
  "notes.create",
  "notes.update",
  "notes.moveToTrash",
  "notes.openAttachments",
  "notes.openAttachmentFile",
  "notes.importAttachments",

  "config.get",
  "config.openInTextEditor",
  "config.selectNoteDirectory",
  "config.openNoteDirectory",

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
  "app.toggleAutoHideAppMenu"(): Promise<void>;

  // Shortcuts
  "shortcuts.getAll"(): Promise<Shortcut[]>;

  // Notes
  "notes.getAll"(): Promise<Note[]>;
  "notes.create"(params: NoteCreateParams): Promise<Note>;
  "notes.update"(id: string, params: NoteUpdateParams): Promise<void>;
  "notes.moveToTrash"(id: string): Promise<void>;
  "notes.openAttachments"(id: string): Promise<void>;
  "notes.openAttachmentFile"(href: string): Promise<void>;
  "notes.importAttachments"(
    id: string,
    attachments: FileInfo[],
  ): Promise<Attachment[]>;

  // Config
  "config.openInTextEditor"(): Promise<void>;
  "config.selectNoteDirectory"(): Promise<void>;
  "config.openNoteDirectory"(): Promise<void>;

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

export enum IpcChannel {
  // Prefix with ipc: to avoid naming collisions with built in HTML events.
  BrowserWindow = "ipc:browser-window",
  ApplicationMenu = "ipc:application-menu",
  ContextMenu = "ipc:context-menu",
}

export enum BrowserWindowEvent {
  Blur = "blur",
}
