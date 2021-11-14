import { isDevelopment } from "../../shared/env";
import { ConfigIpcType, IpcHandler } from "../../shared/ipc";
import { LoadConfig, SaveConfig } from "../../shared/ipc/config";
import { readFile, writeFile } from "../fileSystem";

const FILE_WHITELIST = ["appstate.json", "shortcuts.json"];

const load: IpcHandler<LoadConfig> = async ({ name }) => {
  if (FILE_WHITELIST.indexOf(name) === -1) {
    const message = isDevelopment()
      ? `Unauthorized. File ${name} is not whitelisted. Please check the spelling or add it to FILE_WHITELIST`
      : "authorized";

    throw Error(message);
  }

  const file = await readFile(name, "json");
  return file;
};

const save: IpcHandler<SaveConfig> = async ({ name, content }) => {
  if (FILE_WHITELIST.indexOf(name) === -1) {
    const message = isDevelopment()
      ? `Unauthorized. File ${name} is not whitelisted.`
      : "authorized";

    throw Error(message);
  }

  writeFile(name, content, "json");
};

export const configHandlers: Record<ConfigIpcType, IpcHandler> = {
  "config.load": load,
  "config.save": save,
};
