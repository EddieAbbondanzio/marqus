import { app, dialog, shell } from "electron";
import { Config } from "../../../shared/domain/config";
import { JsonFile, loadJsonFile } from "../../json";
import { CONFIG_SCHEMAS } from "../../schemas/config";
import { isDevelopment, isProduction } from "../../../shared/env";
import * as path from "path";
import * as fs from "fs";
import * as fsp from "fs/promises";
import { IpcPlugin } from "..";
import { getLatestSchemaVersion } from "../../schemas/utils";
import { cloneDeep } from "lodash";
import { logger } from "../../logger";

export const CONFIG_FILE = "config.json";
export const DEFAULT_DEV_NOTE_DIRECTORY = "notes";
export const DEFAULT_DEV_LOG_DIRECTORY = "logs";
export const DEFAULT_WINDOW_HEIGHT = 600;
export const DEFAULT_WINDOW_WIDTH = 800;

export const configIpcPlugin: IpcPlugin = {
  "config.get": ({ config }) => {
    const clonedConfig = cloneDeep(config.content) as Config;

    // We don't tell the app about a noteDirectory if the folder doesn't exist
    // in the FS because this makes the user go through setup again. This gives
    // them the chance to fix the error themselves.
    if (
      clonedConfig.noteDirectory &&
      !fs.existsSync(clonedConfig.noteDirectory)
    ) {
      delete clonedConfig.noteDirectory;
    }

    return clonedConfig;
  },

  "config.openInTextEditor": async () => {
    const configPath = path.join(getConfigDirectory(), CONFIG_FILE);
    const err = await shell.openPath(configPath);
    if (err) {
      logger.error(`Failed to open config.`, err)
      throw new Error(err);
    }
  },

  "config.openNoteDirectory": async ({ config }) => {
    if (config.content.noteDirectory == null) {
      return;
    }

    const err = await shell.openPath(config.content.noteDirectory);
    if (err) {
      throw new Error(err);
    }
  },

  "config.selectNoteDirectory": async ({
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
      await config.update({ noteDirectory: filePaths[0] });
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

  const configPath = path.join(getConfigDirectory(), CONFIG_FILE);
  logger.info(`Loading config ${configPath}`);


  const configFile = await loadJsonFile<Config>(
    configPath,
    CONFIG_SCHEMAS,
    { defaultContent },
  );

  if (isDevelopment()) {
    const defaults: Partial<Config> = {
      logDirectory: DEFAULT_DEV_LOG_DIRECTORY,
    };

    if (!fs.existsSync(DEFAULT_DEV_LOG_DIRECTORY)) {
      await fsp.mkdir(DEFAULT_DEV_LOG_DIRECTORY);
    }

    if (!configFile.content.noteDirectory) {
      defaults.noteDirectory = DEFAULT_DEV_NOTE_DIRECTORY;

      if (!fs.existsSync(DEFAULT_DEV_NOTE_DIRECTORY)) {
        await fsp.mkdir(DEFAULT_DEV_NOTE_DIRECTORY);
      }
    }

    await configFile.update(defaults);
  }

  return configFile;
}

export function getConfigDirectory(): string {
  let configDir;

  if (isProduction()) {
    configDir = app.getPath('userData');
  } else {
    configDir = process.cwd();
  }

  logger.info(`getConfigDirectory: ${configDir}`)
  return configDir
}
