import { NotSupportedError } from "../../shared/errors";
import { RpcRegistry } from "../../shared/rpc";
import { exists, readFile, writeFile } from "../fileSystem";
import { Config } from "../../shared/domain/config";
import { app } from "electron";
import * as path from "path";

export const CONFIG_FILE = "config.json";

export const configRpcs: RpcRegistry<"config"> = {
  "config.load": async () => {
    const configPath = getConfigPath();
    
    if(exists())    
    
    
    const platform = os.platform();
    if (platform !== "linux") {
      throw new NotSupportedError(`Unsupported platform ${platform}`);
    }

    const configFile = await readFile(LINUX_CONFIG_PATH, "json");
    return configFile;
  },
  "config.setDataDirectory": async (dataDirectory) => {
    const platform = os.platform();
    if (platform !== "linux") {
      throw new NotSupportedError(`Unsupported platform ${platform}`);
    }

    let configFile: Config | null = await readFile(LINUX_CONFIG_PATH, "json");
    if (configFile == null) {
      configFile = {
        dataDirectory,
      };
    }

    await writeFile(LINUX_CONFIG_PATH, configFile, "json");
  },
};

export function getConfigPath() {
  const dir = app.getPath("userData");
  return path.join(dir, CONFIG_FILE);
}