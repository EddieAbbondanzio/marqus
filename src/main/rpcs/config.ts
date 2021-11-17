import { isDevelopment } from "../../shared/env";
import { RpcHandler, RpcRegistry } from "../../shared/rpc";
import { Config, LoadConfig, SaveConfig } from "../../shared/rpc/config";
import { readFile, writeFile } from "../fileSystem";

const FILE_WHITELIST = ["appstate.json", "shortcuts.json"];

const load: RpcHandler<"config.load"> = async ({ name }) => {
  if (FILE_WHITELIST.indexOf(name) === -1) {
    const message = isDevelopment()
      ? `Unauthorized. File ${name} is not whitelisted. Please check the spelling or add it to FILE_WHITELIST`
      : "authorized";

    throw Error(message);
  }

  const file = await readFile(name, "json");
  return file as Config;
};

const save: RpcHandler<"config.save"> = async ({ name, content }) => {
  if (FILE_WHITELIST.indexOf(name) === -1) {
    const message = isDevelopment()
      ? `Unauthorized. File ${name} is not whitelisted.`
      : "authorized";

    throw Error(message);
  }

  writeFile(name, content, "json");
  return content;
};

export const configHandlers: RpcRegistry = {
  "config.load": load,
  "config.save": save,
};
