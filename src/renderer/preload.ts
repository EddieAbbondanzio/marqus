import { contextBridge, ipcRenderer } from "electron";
import { getProcessType, isDevelopment } from "../shared/env";
import { IpcChannel, IPCS, IpcType } from "../shared/ipc";

if (getProcessType() === "main") {
  throw Error(
    "ipcRenderer is null. Did you accidentally import 'preload.ts' into a main process file?",
  );
}

contextBridge.exposeInMainWorld("ipc", (ipcType: IpcType, ...data: []) => {
  // We need to be really careful about what we expose in the renderer.
  // ipcRenderer shouldn't be directly exposed to the renderer and we also want
  // to perform some validation to ensure the action is a known one.
  // See for more info:
  // https://stackoverflow.com/questions/57807459/how-to-use-preload-js-properly-in-electron

  if (IPCS.includes(ipcType)) {
    return ipcRenderer.invoke(ipcType, ...data);
  }
});

// Sanity check
if (isDevelopment()) {
  // eslint-disable-next-line no-console
  console.log("preload complete");
}

for (const channel of Object.values(IpcChannel)) {
  ipcRenderer.on(channel, (_, val: unknown) => {
    const ev = new CustomEvent(channel, { detail: val });
    window.dispatchEvent(ev);
  });
}
