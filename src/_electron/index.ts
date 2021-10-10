export type IpcType = "promptUser" | "fileSystem";
export type IpcHandler<I> = (arg: I) => Promise<any>;
export type IpcArgument = { id: string; type: IpcType; value: any };
