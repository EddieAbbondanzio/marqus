import { contextBridge, ipcRenderer } from "electron";
import { getProcessType, isDevelopment } from "../shared/env";
import { Invoker, IpcChannels } from "../shared/ipc";

if (getProcessType() === "main") {
  throw Error(
    "ipcRenderer is null. Did you accidentally import 'preload.ts' into a main process file?"
  );
}

// Only thing that should be exposed.
contextBridge.exposeInMainWorld("ipc", ipcRenderer.invoke);

declare global {
  interface Window {
    ipc: Invoker;
  }
}

// Sanity check
if (isDevelopment()) {
  // eslint-disable-next-line no-console
  console.log("preload complete");
}

// Dispatch custom event to notify of application menu clicks
ipcRenderer.on(IpcChannels.ApplicationMenuClick, (_, val: any) => {
  const ev = new CustomEvent("applicationmenu", {
    detail: val,
  });
  window.dispatchEvent(ev);
});
