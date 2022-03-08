import { contextBridge, ipcRenderer } from "electron";
import { getNodeEnv, getProcessType } from "../shared/env";
import { Ipc } from "../shared/ipc";

if (getProcessType() === "main") {
  throw Error(
    "ipcRenderer is null. Did you accidentally import 'preload.ts' into a main process file?"
  );
}

/**
 * Send an Ipc to the main thread.
 * @param type String of the type
 * @param input Payload.
 * @returns The response the main thread gave
 */
const ipc: Ipc = async (type: string, input?: any): Promise<any> =>
  ipcRenderer.invoke(type, input);

// Only thing that should be exposed.
contextBridge.exposeInMainWorld("ipc", ipc);

declare global {
  interface Window {
    ipc: Ipc;
  }
}

// Sanity check
if (getNodeEnv() === "development") {
  console.log("preload complete");
}
