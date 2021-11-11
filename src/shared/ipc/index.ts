import { generateEventHook } from "../events";

export type TagIpcType =
  | "tags.getAll"
  | "tags.create"
  | "tags.update"
  | "tags.delete";
export type ConfigIpcType = "config.load" | "config.save";
export type UIIpcType = "ui.promptUser";

export type IpcType = TagIpcType | ConfigIpcType | UIIpcType;

export type SendIpc<R> = (type: IpcType, value?: any) => Promise<R>;

export type IpcHandler<I = unknown> = (arg: I) => Promise<any>;
export type IpcPlugin<H> = (sendIpc: SendIpc<any>) => H;
export type IpcArgument = { id: string; type: IpcType; value: any };

export const [onInitPlugin, notifyOnInitPlugin] =
  generateEventHook<SendIpc<any>>();
