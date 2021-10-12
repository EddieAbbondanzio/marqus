export type IpcType = "promptUser" | "fileSystem";
export type SendIpc<R> = (type: IpcType, value: any) => Promise<R>;

export type IpcHandler<I> = (arg: I) => Promise<any>;
export type IpcPlugin<I> = (sendIpc: SendIpc<I>) => IpcHandler<I>;
export type IpcArgument = { id: string; type: IpcType; value: any };
