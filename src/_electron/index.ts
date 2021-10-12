export type IpcType = "promptUser" | "fileSystem";
export type IpcHandler<I> = (arg: I) => Promise<any>;
export type IpcArgument = { id: string; type: IpcType; value: any };

export type SendIpc<R> = (type: IpcType, value: any) => Promise<R>;

export interface BridgedWindow {
  sendIpc: SendIpc<any>;
}
