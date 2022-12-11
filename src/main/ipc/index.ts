import { BrowserWindow, IpcMainInvokeEvent } from "electron";
import { isFunction, wrap } from "lodash";
import { MaybeThunk } from "tsdef";
import { Config } from "../../shared/domain/config";
import { IPCS, IpcSchema, IpcType } from "../../shared/ipc";
import { Logger } from "../../shared/logger";
import { JsonFile } from "../json";
import { appIpcPlugin } from "./plugins/app";
import { configIpcPlugin } from "./plugins/config";
import { logIpcPlugin } from "./plugins/log";
import { noteIpcPlugin } from "./plugins/notes";
import { shortcutsIpcPlugin } from "./plugins/shortcuts";

export const IPC_PLUGINS = [
  appIpcPlugin,
  configIpcPlugin,
  logIpcPlugin,
  noteIpcPlugin,
  shortcutsIpcPlugin,
];

// Wrap IpcMain to add type safety + make it easy to test.
// This comes off like a code smell but I like how hands off of an approach it is
// and it also keeps the amount of boilerplate code low.
export interface IpcMainTS {
  handle<Type extends IpcType>(
    type: Type,
    handler: (
      event: IpcMainInvokeEvent,
      ...params: Parameters<IpcSchema[Type]>
    ) => ReturnType<IpcSchema[Type]>,
  ): void;
  removeHandler(type: IpcType): void;
}

export type IpcPlugin = {
  // If callback is returned, it'll be invoked when the module is disposed.
  onInit?(ctx: InitContext): void | OnDispose | Promise<void | OnDispose>;
} & {
  [I in keyof IpcSchema]?: IpcAction<I>;
};

export interface AppContext {
  browserWindow: BrowserWindow;
  config: JsonFile<Config>;
  log: Logger;
  blockAppFromQuitting: (cb: () => Promise<void>) => Promise<void>;
  reloadIpcPlugins: () => Promise<void>;
}

export type InitContext = Pick<AppContext, "browserWindow" | "config">;

export type OnDispose = () => MaybeThunk<Promise<void> | void>;

export type IpcAction<T extends IpcType> = (
  context: AppContext,
  ...params: Parameters<IpcSchema[T]>
) => ReturnType<IpcSchema[T]>;

export async function initPlugins(
  plugins: IpcPlugin[],
  ipc: IpcMainTS,
  appContext: AppContext,
): Promise<OnDispose[]> {
  return await Promise.all(
    plugins.map(p => {
      const onDispose = p?.onInit?.(appContext);

      const ipcs = (
        Object.entries(p) as [IpcType, IpcAction<IpcType>][]
      ).filter(([ipcType]) => IPCS.includes(ipcType));

      for (const [ipcType, ipcHandler] of ipcs) {
        ipc.handle(ipcType, (...args: any[]) =>
          ipcHandler(appContext, ...args.slice(1)),
        );
      }

      return () => {
        for (const [ipcType] of ipcs) {
          ipc.removeHandler(ipcType);
        }

        if (isFunction(onDispose)) {
          return onDispose();
        }
      };
    }),
  );
}
