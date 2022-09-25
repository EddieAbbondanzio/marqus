import { app, BrowserWindow, dialog, shell } from "electron";
import { IpcMainTS } from "../shared/ipc";
import { Config } from "../shared/domain/config";
import { JsonFile, loadJsonFile } from "./json";
import { Logger } from "../shared/logger";
import { CONFIG_SCHEMAS } from "./schemas/config";
import { isDevelopment, isTest } from "../shared/env";
import * as path from "path";
import * as fs from "fs";
import * as fsp from "fs/promises";

export const CONFIG_FILE = "config.json";
export const DEFAULT_DEV_DATA_DIRECTORY = "data";
export const DEFAULT_DEV_LOG_DIRECTORY = "logs";
export const DEFAULT_WINDOW_HEIGHT = 600;
export const DEFAULT_WINDOW_WIDTH = 800;

export function configIpcs(
  ipc: IpcMainTS,
  config: JsonFile<Config>,
  log: Logger
): void {
  ipc.handle(
    "config.hasDataDirectory",
    async () => config.content.dataDirectory != null
  );

  ipc.handle("config.openDataDirectory", async () => {
    if (config.content.dataDirectory == null) {
      return;
    }

    shell.openPath(config.content.dataDirectory);
  });

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

    await config.update({ dataDirectory: filePaths[0] });
    focusedWindow.reload();
  });
}

export async function getConfig(): Promise<JsonFile<Config>> {
  const configFile = await loadJsonFile<Config>(
    getConfigPath(),
    CONFIG_SCHEMAS,
    {
      version: 2,
      windowHeight: DEFAULT_WINDOW_HEIGHT,
      windowWidth: DEFAULT_WINDOW_WIDTH,
      logDirectory: app.getPath("logs"),
    }
  );

  // Override directories when running in development.
  if (isDevelopment()) {
    await configFile.update({
      dataDirectory: DEFAULT_DEV_DATA_DIRECTORY,
      logDirectory: DEFAULT_DEV_LOG_DIRECTORY,
    });
  }

  // Always check if we need to recreate the data directory on start. It may have
  // been deleted to clear out notes.
  if (
    configFile.content.dataDirectory != null &&
    !fs.existsSync(configFile.content.dataDirectory)
  ) {
    await fsp.mkdir(configFile.content.dataDirectory);
  }
  /*  */
  return configFile;
}

export function getConfigPath(): string {
  if (isDevelopment()) {
    return path.join(process.cwd(), CONFIG_FILE);
  } else if (isTest()) {
    return "";
  } else {
    return path.join(app.getPath("userData"), CONFIG_FILE);
  }
}
