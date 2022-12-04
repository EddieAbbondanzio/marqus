// declare global {
interface Window {
  ipc: Ipc;
  addEventListener(
    type: IpcChannel,
    l: (this: Window, ev: CustomEvent) => void | Promise<void>,
  ): void;
  removeEventListener(
    type: IpcChannel,
    l: (this: Window, ev: CustomEvent) => void | Promise<void>,
  ): void;
}
// }
