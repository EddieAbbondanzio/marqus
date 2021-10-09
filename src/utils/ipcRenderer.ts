import { IpcRenderer } from "electron";

export const ipcRenderer = (window as any).ipcRenderer as IpcRenderer;
