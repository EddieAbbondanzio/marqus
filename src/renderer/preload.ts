import { contextBridge, ipcRenderer } from "electron";
import { generateId } from "../shared/state";
import { getNodeEnv, getProcessType } from "../shared/env";
import { RpcType, Rpc } from "../shared/rpc";
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
 * Send an rpc to the main thread.
 * @param type String of the type
 * @param input Payload.
 * @returns The response the main thread gave
 */
const rpc: Rpc = async (type: string, input?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const id = generateId();
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
contextBridge.exposeInMainWorld("rpc", rpc);

declare global {
  interface Window {
    rpc: Rpc;
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
