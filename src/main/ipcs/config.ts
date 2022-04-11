import { InvalidOpError, MissingDataDirectoryError } from "../../shared/errors";
import { createDirectory, exists, readFile, writeFile } from "../fileSystem";
import { Config, DEFAULT_CONFIG } from "../../shared/domain/config";
import { app, BrowserWindow, dialog, shell } from "electron";
import * as path from "path";
import { isDevelopment, isProduction } from "../../shared/env";
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
      throw new InvalidOpError();
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
  let config: Config = await readFile(getConfigPath(), "json");
  config ??= DEFAULT_CONFIG;
  if (isDevelopment()) {
    config.dataDirectory = DEFAULT_DEV_DATA_DIRECTORY;

    if (!exists(config.dataDirectory)) {
      await createDirectory(config.dataDirectory);
    }
  }

  // Sanity check
  if (
    isProduction() &&
    config.dataDirectory != null &&
    !(await exists(config.dataDirectory))
  ) {
    throw new MissingDataDirectoryError();
  }

  return config;
}

export async function saveConfig(config: Config): Promise<void> {
  await writeFile(getConfigPath(), config, "json");
}

export function getConfigPath(): string {
  if (isDevelopment()) {
    return path.join(process.cwd(), CONFIG_FILE);
  } else {
    return path.join(app.getPath("userData"), CONFIG_FILE);
  }
}
