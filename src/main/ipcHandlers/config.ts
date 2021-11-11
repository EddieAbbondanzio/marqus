import { ConfigIpcType, IpcHandler } from "../../shared/ipc";
import { LoadConfig, SaveConfig } from "../../shared/ipc/config";
import { readFile, writeFile } from "../fileSystem";

const load: IpcHandler<LoadConfig> = async ({ name }) => readFile(name, "json");

const save: IpcHandler<SaveConfig> = async ({ name, content }) =>
  writeFile(name, content, "json");

export const configHandlers: Record<ConfigIpcType, IpcHandler> = {
  "config.load": load,
  "config.save": save,
};
