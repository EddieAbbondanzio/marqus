import { contextBridge, ipcRenderer } from "electron";
import { getProcessType, isDevelopment } from "../shared/env";
import { Ipc, IpcChannel, IPCS, IpcSchema, IpcType } from "../shared/ipc";

if (getProcessType() === "main") {
  throw Error(
    "ipcRenderer is null. Did you accidentally import 'preload.ts' into a main process file?"
  );
}

contextBridge.exposeInMainWorld("ipc", (channel: IpcType, data: unknown) => {
  // We need to be really careful about what we expose in the renderer.
  // ipcRenderer shouldn't be directly exposed to the renderer and we also want
  // to perform some validation to ensure the action is a known one.
  // See for more info:
  // https://stackoverflow.com/questions/57807459/how-to-use-preload-js-properly-in-electron

  if (IPCS.includes(channel)) {
    return ipcRenderer.invoke(channel, data);
  }
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
