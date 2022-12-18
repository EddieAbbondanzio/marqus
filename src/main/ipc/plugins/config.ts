import { app, dialog, shell } from "electron";
import { Config } from "../../../shared/domain/config";
import { JsonFile, loadJsonFile } from "../../json";
import { CONFIG_SCHEMAS } from "../../schemas/config";
import { isDevelopment, isProduction, isTest } from "../../../shared/env";
import * as path from "path";
import * as fs from "fs";
import * as fsp from "fs/promises";
import { IpcPlugin } from "..";
import { getLatestSchemaVersion } from "../../schemas/utils";

export const CONFIG_FILE = "config.json";
export const DEFAULT_DEV_DATA_DIRECTORY = "data";
export const DEFAULT_DEV_LOG_DIRECTORY = "logs";
export const DEFAULT_WINDOW_HEIGHT = 600;
export const DEFAULT_WINDOW_WIDTH = 800;

export const configIpcPlugin: IpcPlugin = {
  "config.get": ({ config }) => config.content,

  "config.openInTextEditor": async () => {
    const configPath = path.join(getConfigDirectory(), CONFIG_FILE);
    const err = await shell.openPath(configPath);
    if (err) {
      throw new Error(err);
    }
  },

  "config.openDataDirectory": async ({ config }) => {
    if (config.content.dataDirectory == null) {
      return;
    }

    const err = await shell.openPath(config.content.dataDirectory);
    if (err) {
      throw new Error(err);
    }
  },

  "config.selectDataDirectory": async ({
    browserWindow,
    blockAppFromQuitting,
    config,
    reloadIpcPlugins,
  }) => {
    const { filePaths } = await dialog.showOpenDialog(browserWindow, {
      properties: ["openDirectory"],
    });
    if (filePaths.length == 0) {
      return;
    }

    await blockAppFromQuitting(async () => {
      await config.update({ dataDirectory: filePaths[0] });
    });

    await reloadIpcPlugins();
    browserWindow.reload();
  },
};

export async function getConfig(): Promise<JsonFile<Config>> {
  const latestVersion = getLatestSchemaVersion(CONFIG_SCHEMAS);

  const defaultContent: Config = {
    version: latestVersion,
    windowHeight: DEFAULT_WINDOW_HEIGHT,
    windowWidth: DEFAULT_WINDOW_WIDTH,
    logDirectory: app.getPath("logs"),
  };

  const configFile = await loadJsonFile<Config>(
    path.join(getConfigDirectory(), CONFIG_FILE),
    CONFIG_SCHEMAS,
    { defaultContent },
  );

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

  return configFile;
}

export function getConfigDirectory(): string {
  if (isProduction()) {
    return app.getPath("userData");
  } else {
    return process.cwd();
  }
}
