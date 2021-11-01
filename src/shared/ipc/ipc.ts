export type IpcType = "promptUser";
export type SendIpc<R> = (type: IpcType, value: any) => Promise<R>;

export type IpcHandler<I> = (arg: I) => Promise<any>;
export type IpcPlugin<H> = (sendIpc: SendIpc<any>) => H;
export type IpcArgument = { id: string; type: IpcType; value: any };
