import { NotFoundError } from "../../shared/errors";
import { IpcRegistry } from "../../shared/ipc";
import { readFile, writeFile } from "../fileSystem";
import { Config } from "../../shared/domain/config";
import { app } from "electron";
import * as path from "path";

export const CONFIG_FILE = "config.json";

export const configIpcs: IpcRegistry<"config"> = {
  "config.load": async () => {
    return await getConfig();
  },
  "config.setDataDirectory": async (dataDirectory) => {
    let config = await getConfig();
    config = Object.assign(config, { dataDirectory });

    const userDataDir = app.getPath("userData");
    const filePath = path.join(userDataDir, CONFIG_FILE);
    await writeFile(filePath, config, "json");
  },
  "config.hasDataDirectory": async () => {
    const config = await getConfig();
    return config?.dataDirectory != null;
  },
};

export async function getConfig(): Promise<Config | null>;
export async function getConfig(opts?: { required: true }): Promise<Config> {
  const userDataDir = app.getPath("userData");
  const filePath = path.join(userDataDir, CONFIG_FILE);
  const data = await readFile(filePath, "json");

  if (data == null && opts?.required) {
    throw new NotFoundError("No config file was found");
  }

  return data;
}
