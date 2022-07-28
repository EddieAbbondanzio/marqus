import { MissingDataDirectoryError } from "../../shared/errors";
import { createDirectory, exists, readFile, writeFile } from "../fileSystem";
import { Config } from "../../shared/domain/config";
import { app, BrowserWindow, dialog, shell } from "electron";
import * as path from "path";
import { isDevelopment, isProduction, isTest } from "../../shared/env";
import { IpcPlugin } from "../../shared/ipc";

export const CONFIG_FILE = "config.json";
export const DEFAULT_DEV_DATA_DIRECTORY = "data";

export const useConfigIpcs: IpcPlugin = (ipc, config) => {
  ipc.handle(
    "config.hasDataDirectory",
    async () => config.dataDirectory != null
  );

  ipc.handle("config.selectDataDirectory", async () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow == null) {
      throw new Error();
    }

    const { filePaths } = await dialog.showOpenDialog(focusedWindow, {
      properties: ["openDirectory"],
    });
    if (filePaths.length == 0) {
      return;
    }

    config.dataDirectory = filePaths[0];

    await writeFile(getConfigPath(), config, "json");
    focusedWindow.reload();
  });
  ipc.handle("config.openDataDirectory", async () => {
    if (config.dataDirectory == null) {
      return;
    }

    shell.openPath(config.dataDirectory);
  });
};

export async function loadConfig(): Promise<Config> {
  let data = await readFile(getConfigPath(), "json");
  data ??= new Config(600, 800);

  if (isDevelopment()) {
    data.dataDirectory = DEFAULT_DEV_DATA_DIRECTORY;

    if (!exists(data.dataDirectory)) {
      await createDirectory(data.dataDirectory);
    }
  }

  // Sanity check
  if (
    isProduction() &&
    data.dataDirectory != null &&
    !(await exists(data.dataDirectory))
  ) {
    throw new MissingDataDirectoryError();
  }

  return new Config(data.windowHeight, data.windowWidth, data.dataDirectory);
}

export async function saveConfig(config: Config): Promise<void> {
  throw new Error("saveConfig");
  await writeFile(getConfigPath(), config, "json");
}

export function getConfigPath(): string {
  if (isDevelopment()) {
    return path.join(process.cwd(), CONFIG_FILE);
  } else if (isTest()) {
    throw new Error("getConfigPath doesn't work in test.");
  } else {
    return path.join(app.getPath("userData"), CONFIG_FILE);
  }
}
