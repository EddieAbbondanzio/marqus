import { contextBridge, ipcRenderer } from "electron";
import { getProcessType, isDevelopment } from "../shared/env";
import { Ipc, IpcChannel } from "../shared/ipc";

console.log("STARTING PRELOAD");

if (getProcessType() === "main") {
  throw Error(
    "ipcRenderer is null. Did you accidentally import 'preload.ts' into a main process file?"
  );
}

// Only thing that should be exposed.
contextBridge.exposeInMainWorld("ipc", ipcRenderer.invoke);

declare global {
  interface Window {
    ipc: Ipc;
  }
}

// Sanity check
if (isDevelopment()) {
  // eslint-disable-next-line no-console
  console.log("preload complete");
}

// Dispatch custom event to notify of application menu clicks
ipcRenderer.on(IpcChannel.ApplicationMenuClick, (_, val: any) => {
  const ev = new CustomEvent(IpcChannel.ApplicationMenuClick, {
    detail: val,
  });
  window.dispatchEvent(ev);
});

ipcRenderer.on(IpcChannel.ContextMenuClick, (_, val: any) => {
  const ev = new CustomEvent(IpcChannel.ContextMenuClick, {
    detail: val,
  });
  window.dispatchEvent(ev);
});
