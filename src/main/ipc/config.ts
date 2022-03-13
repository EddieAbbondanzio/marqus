import { InvalidOpError, NotFoundError } from "../../shared/errors";
import { readFile, writeFile } from "../fileSystem";
import { Config, DEFAULT_CONFIG } from "../../shared/domain/config";
import { app, BrowserWindow, dialog } from "electron";

import * as path from "path";
import { isDevelopment } from "../../shared/env";
import { IpcPlugin } from "../types";

export const CONFIG_FILE = "config.json";

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
};

export async function loadConfig(): Promise<Config> {
  let config: Config = await readFile(getConfigPath(), "json");
  config ??= DEFAULT_CONFIG;
  if (isDevelopment()) {
    config.dataDirectory = "data";
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
