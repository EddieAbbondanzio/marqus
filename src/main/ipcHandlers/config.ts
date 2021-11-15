import { isDevelopment } from "../../shared/env";
import { IpcHandler, IpcRegistry } from "../../shared/ipc";
import { Config, LoadConfig, SaveConfig } from "../../shared/ipc/config";
import { readFile, writeFile } from "../fileSystem";

const FILE_WHITELIST = ["appstate.json", "shortcuts.json"];

const load: IpcHandler<"config.load"> = async ({ name }) => {
  if (FILE_WHITELIST.indexOf(name) === -1) {
    const message = isDevelopment()
      ? `Unauthorized. File ${name} is not whitelisted. Please check the spelling or add it to FILE_WHITELIST`
      : "authorized";

    throw Error(message);
  }

  const file = await readFile(name, "json");
  return file as Config;
};

const save: IpcHandler<"config.save"> = async ({ name, content }) => {
  if (FILE_WHITELIST.indexOf(name) === -1) {
    const message = isDevelopment()
      ? `Unauthorized. File ${name} is not whitelisted.`
      : "authorized";

    throw Error(message);
  }

  writeFile(name, content, "json");
  return content;
};

export const configHandlers: IpcRegistry = {
  "config.load": load,
  "config.save": save,
};
