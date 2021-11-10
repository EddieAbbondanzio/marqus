import { contextBridge, ipcRenderer } from "electron";
import { generateId } from "../shared/domain/id";
import { isDevelopment } from "../shared/env";
import { SendIpc, IpcType, notifyOnInitPlugin } from "../shared/ipc";
import { tagsPlugin } from "./api/tags";
import { appStatePlugin } from "./ui/appState";
import { promptUserPlugin } from "./ui/promptUser";

export interface ExposedPromise {
  resolve: (val: any) => unknown;
  reject: (err: any) => unknown;
}

const promises: { [id: string]: ExposedPromise } = {};

if (ipcRenderer == null) {
  throw Error(
    "ipcRenderer is null. Did you accidentally import 'preload.ts' into a main process file?"
  );
}

/*
 * Listen on render for main responses.
 */
ipcRenderer.on("send", async (ev, arg) => {
  if (isError(arg)) {
    throw Error(arg.error);
  }

  const { id, value } = arg;

  const p = promises[id];
  if (p == null) {
    return;
  }

  if (isError(arg)) {
    /*
     * This will let us "throw" errors from the main thread.
     */
    p.reject(arg.error);
  } else {
    p.resolve(value);
  }
});

/**
 * Send an ipc to the main thread.
 * @param type String of the type
 * @param value Payload.
 * @returns The response the main thread gave
 */
const sendIpc: SendIpc<any> = (type: IpcType, value: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const id = generateId();
    promises[id] = { resolve, reject };

    ipcRenderer.send("send", {
      id,
      type,
      value,
    });
  });
};

contextBridge.exposeInMainWorld("promptUser", promptUserPlugin(sendIpc));
contextBridge.exposeInMainWorld("api", tagsPlugin(sendIpc));
contextBridge.exposeInMainWorld("appState", appStatePlugin(sendIpc));

notifyOnInitPlugin(sendIpc);

export function isError(
  err: Record<string, unknown>
): err is { error: string } {
  // eslint-disable-next-line no-prototype-builtins
  return err.hasOwnProperty("error");
}

if (process.env.NODE_ENV === "development") {
  console.log("preload complete");
}