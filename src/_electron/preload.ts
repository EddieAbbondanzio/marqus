// import { generateId } from "@/utils";
import { generateId } from "@/utils";
import { contextBridge, ipcRenderer } from "electron";
import { IpcType } from ".";
import { promptUser } from "./promptUser/renderer";

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
     * This will let us "throw" errors from the main thread. No stack trace included
     * for security reasons.
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
export async function sendIpc<R>(type: IpcType, value: any): Promise<R> {
  return new Promise((resolve, reject) => {
    const id = generateId();
    promises[id] = { resolve, reject };

    ipcRenderer.send("send", {
      id,
      type,
      value,
    });
  });
}
contextBridge.exposeInMainWorld("promptUser", promptUser);
// contextBridge.exposeInMainWorld("fileSystem", fileSystem);

export function isError(
  err: Record<string, unknown>
): err is { error: string } {
  return err.hasOwnProperty("error");
}

console.log("preloaded");
