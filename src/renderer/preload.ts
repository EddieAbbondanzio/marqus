import { contextBridge, ipcRenderer } from "electron";
import { generateId } from "../shared/id";
import { SendIpc, IpcType } from "../shared/ipc/ipc";
import { tagsPlugin } from "./api/tags";
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

export function isError(
  err: Record<string, unknown>
): err is { error: string } {
  return err.hasOwnProperty("error");
}

if (process.env.NODE_ENV === "development") {
  console.log("preload complete");
}
