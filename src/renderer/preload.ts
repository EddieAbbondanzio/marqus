import { contextBridge, ipcRenderer } from "electron";
import { customAlphabet } from "nanoid";
import { _uuid } from "../shared/domain/id";
import { getNodeEnv, getProcessType } from "../shared/env";
import { IpcType, Ipc } from "../shared/ipc";
export interface ExposedPromise {
  resolve: (val: any) => unknown;
  reject: (err: any) => unknown;
}

const promises: { [id: string]: ExposedPromise } = {};

if (getProcessType() === "main") {
  throw Error(
    "ipcRenderer is null. Did you accidentally import 'preload.ts' into a main process file?"
  );
}

/*
 * Listen on render for main responses.
 */
ipcRenderer.on("send", async (_, arg) => {
  const { id, value } = arg;
  const p = promises[id];

  if (p == null) {
    console.warn("No promise found.", { arg, promises });

    // The main thread may need to throw a random error.
    if (isError(arg)) {
      throw Error(arg.error);
    } else {
      return;
    }
  }

  delete promises[id];

  if (isError(arg)) {
    p.reject(arg.error);
  } else {
    p.resolve(value);
  }
});

/**
 * Send an Ipc to the main thread.
 * @param type String of the type
 * @param input Payload.
 * @returns The response the main thread gave
 */
const ipc: Ipc = async (type: string, input?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const id = _uuid();
    promises[id] = { resolve, reject };

    let value;

    // Remove out any methods
    if (input != null) {
      value = JSON.parse(JSON.stringify(input));
    }

    ipcRenderer.send("send", {
      id,
      type,
      value,
    });
  });
};

// Only thing that should be exposed.
contextBridge.exposeInMainWorld("ipc", ipc);

declare global {
  interface Window {
    ipc: Ipc;
  }
}

export function isError(
  err: Record<string, unknown>
): err is { error: string } {
  // eslint-disable-next-line no-prototype-builtins
  return err.hasOwnProperty("error");
}

// Sanity check
if (getNodeEnv() === "development") {
  console.log("preload complete");
}
