import { contextBridge, ipcRenderer } from "electron";
import { getProcessType, isDevelopment } from "../shared/env";
import { Ipc, IpcChannel } from "../shared/ipc";

if (getProcessType() === "main") {
  throw Error(
    "ipcRenderer is null. Did you accidentally import 'preload.ts' into a main process file?"
  );
}

// Only thing that should be exposed.
contextBridge.exposeInMainWorld("ipc", (channel: string, data: unknown) => {
  // Be careful!
  // See here for security concerns: https://stackoverflow.com/a/59814127

  return ipcRenderer.invoke(channel, data);
});

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
