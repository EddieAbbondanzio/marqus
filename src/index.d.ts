import { IpcRenderer } from "electron";

declare interface Window {
  ipcRenderer: IpcRenderer;
}
