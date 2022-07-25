import { IpcMainInvokeEvent } from "electron";
import { NotImplementedError } from "../../src/shared/errors";
import { IpcMainTS, IpcSchema, IpcType } from "../../src/shared/ipc";

export class MockedIpcMainTS implements IpcMainTS {
  // Type safety is not a concern here.
  handlers: Partial<Record<IpcType, (...args: any[]) => any>> = {};

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

  on(event: "init", callback: () => Promise<void>): void {
    // TODO: Implement this lol.
  }
}

export function createIpcMainTS(): MockedIpcMainTS {
  return new MockedIpcMainTS();
}
