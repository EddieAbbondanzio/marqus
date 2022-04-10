import { Config } from "../shared/domain/config";
import { IpcHandler, IpcType } from "../shared/ipc";

// Basic wrapper for intellisense and easy testing support
export interface TypeSafeIpc {
  handle<Type extends IpcType>(type: Type, handler: IpcHandler<Type>): void;
}

export type IpcPlugin = (ipc: TypeSafeIpc, config: Config) => void;
