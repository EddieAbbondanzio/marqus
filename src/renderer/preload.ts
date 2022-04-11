import { contextBridge, ipcRenderer } from "electron";
import { getProcessType, isDevelopment } from "../shared/env";
import { IpcRendererTS } from "../shared/ipc";

if (getProcessType() === "main") {
  throw Error(
    "ipcRenderer is null. Did you accidentally import 'preload.ts' into a main process file?"
  );
}

// Wrapped for testing purposes.
const ipcRendererTS: IpcRendererTS = {
  invoke: ipcRenderer.invoke,
  _on: ipcRenderer.on,
  _off: ipcRenderer.off,
  _send: ipcRenderer.send,
};

// Only thing that should be exposed.
contextBridge.exposeInMainWorld("ipc", ipcRendererTS);

declare global {
  interface Window {
    ipc: IpcRendererTS;
  }
}

// Sanity check
if (isDevelopment()) {
  // eslint-disable-next-line no-console
  console.log("preload complete");
}
