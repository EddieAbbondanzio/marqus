/* eslint-disable @typescript-eslint/ban-types */
import { IpcMainInvokeEvent } from "electron";
import { IpcEvent, IpcMainTS, IpcSchema, IpcType } from "../../src/shared/ipc";

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
    ) => ReturnType<IpcSchema[Type]>
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

  listeners(eventName: string | symbol): Function[] {
    return this._listeners[eventName as unknown as IpcEvent] ?? [];
  }
}

export function createIpcMainTS(): MockedIpcMainTS {
  return new MockedIpcMainTS();
}
