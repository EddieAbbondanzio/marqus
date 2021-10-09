import { IpcMain } from "electron";

export type RpcType = "prompt";

export interface RpcParams<T> {
  type: RpcType;
  value: T;
}

export interface RpcHandler<P> {
  (value: P): Promise<void>;
}

export function registerRpcHandlers(ipc: IpcMain) {}
