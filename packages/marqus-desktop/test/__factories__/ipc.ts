/* eslint-disable @typescript-eslint/ban-types */
import { IpcMainInvokeEvent } from "electron";
import { AppContext } from "../../src/main/ipc";
import { initPlugins, IpcMainTS, IpcPlugin } from "../../src/main/ipc";
import { IpcSchema, IpcType } from "../../src/shared/ipc";
import { createConfig } from "./config";
import { createBrowserWindow } from "./electron";
import { createJsonFile } from "./json";

export class MockedIpcMainTS implements IpcMainTS {
  // Type safety is not a concern here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlers: Partial<Record<IpcType, (...args: any[]) => any>> = {};

  handle<Type extends IpcType>(
    type: Type,
    handler: (
      event: IpcMainInvokeEvent,
      ...params: Parameters<IpcSchema[Type]>
    ) => ReturnType<IpcSchema[Type]>,
  ): void {
    this.handlers[type] = handler;
  }

  invoke<Type extends IpcType>(
    type: Type,
    ...params: Parameters<IpcSchema[Type]>
  ): ReturnType<IpcSchema[Type]> {
    if (this.handlers[type] == null) {
      throw new Error(`Mock ipc is missing handler for ${type}`);
    }

    return this.handlers[type]!(null, ...params);
  }

  removeHandler(type: IpcType): void {
    delete this.handlers[type];
  }
}

export type MockedAppContext = { ipc: MockedIpcMainTS } & Omit<
  AppContext,
  "ipc"
>;

export const FAKE_NOTE_DIRECTORY = "data";

export async function initIpc(
  partial?: Partial<MockedAppContext>,
  ...ipcPlugins: IpcPlugin[]
): Promise<MockedAppContext> {
  const ipc = partial?.ipc ?? new MockedIpcMainTS();
  const config =
    partial?.config ??
    createJsonFile(createConfig({ noteDirectory: FAKE_NOTE_DIRECTORY }));
  const browserWindow = partial?.browserWindow ?? createBrowserWindow();

  const blockAppFromQuitting = jest.fn().mockImplementation(async cb => {
    await cb();
  });

  let onDispose: (() => Promise<void>) | undefined = undefined;
  const reloadIpcPlugins =
    partial?.reloadIpcPlugins ??
    jest.fn().mockImplementation(async () => {
      if (onDispose != null) {
        await onDispose();
      }

      onDispose = await initPlugins(ipcPlugins, ipc, ctx);
    });

  const ctx = {
    ipc,
    config,
    browserWindow,
    blockAppFromQuitting,
    reloadIpcPlugins,
  };

  onDispose = await initPlugins(ipcPlugins, ipc, ctx);

  return ctx;
}
