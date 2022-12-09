/* eslint-disable @typescript-eslint/ban-types */
import { IpcMainInvokeEvent } from "electron";
import { AppContext } from "../../src/main";
import { IpcEvent, IpcMainTS, IpcSchema, IpcType } from "../../src/shared/ipc";
import { createConfig } from "./config";
import { createBrowserWindow } from "./electron";
import { createJsonFile } from "./json";
import { createLogger } from "./logger";

export class MockedIpcMainTS implements IpcMainTS {
  // Type safety is not a concern here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlers: Partial<Record<IpcType, (...args: any[]) => any>> = {};
  _listeners: Partial<Record<IpcEvent, Function[]>> = {};

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

  on(event: IpcEvent, callback: () => Promise<void>): void {
    this._listeners[event] ??= [];
    this._listeners[event]!.push(callback);
  }

  async trigger(event: IpcEvent): Promise<void> {
    const eventListeners = this._listeners[event] ?? [];

    if (eventListeners.length === 0) {
      throw new Error(`No event listeners for ${event}.`);
    }

    await Promise.all(eventListeners.map(l => l()));
  }

  listeners(eventName: string | symbol): Function[] {
    return this._listeners[eventName as unknown as IpcEvent] ?? [];
  }
}

export function createIpcMainTS(): MockedIpcMainTS {
  return new MockedIpcMainTS();
}

export type MockedAppContext = { ipc: MockedIpcMainTS } & Omit<
  AppContext,
  "ipc"
>;

export const FAKE_DATA_DIRECTORY = "data";
export function createAppContext(
  partial?: Partial<MockedAppContext>,
  ...ipcModules: Array<(ctx: AppContext) => void>
): MockedAppContext {
  const ipc = partial?.ipc ?? createIpcMainTS();
  const config =
    partial?.config ??
    createJsonFile(createConfig({ dataDirectory: FAKE_DATA_DIRECTORY }));
  const log = partial?.log ?? createLogger();
  const browserWindow = partial?.browserWindow ?? createBrowserWindow();

  const ctx = { ipc, config, log, browserWindow };

  for (const ipc of ipcModules) {
    ipc(ctx);
  }

  return ctx;
}
