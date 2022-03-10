import { InvalidOpError, NotFoundError } from "../../shared/errors";
import { IpcRegistry } from "../../shared/ipc";
import { readFile, writeFile } from "../fileSystem";
import {
  Config,
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
} from "../../shared/domain/config";
import { app, BrowserWindow, dialog } from "electron";

import * as path from "path";
import { isDevelopment } from "../../shared/env";

export const CONFIG_FILE = "config.json";

export const configIpcs: IpcRegistry<"config"> = {
  "config.load": async () => {
    return await getConfig();
  },
  "config.hasDataDirectory": async () => {
    const config = await getConfig();
    return config?.dataDirectory != null;
  },
  "config.selectDataDirectory": async () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow == null) {
      throw new InvalidOpError();
    }

    const res = await dialog.showOpenDialog(focusedWindow, {
      properties: ["openDirectory"],
    });

    if (res.filePaths.length === 0) {
      return;
    }

    let config = await getConfig();
    config = Object.assign(config, { dataDirectory: res.filePaths[0] });

    const userDataDir = app.getPath("userData");
    const filePath = path.join(userDataDir, CONFIG_FILE);
    await writeFile(filePath, config, "json");
    configCache = config;
    focusedWindow.reload();
  },
};

let configCache: Config | undefined;

export async function getConfig(): Promise<Config | null>;
export async function getConfig(opts?: { required: true }): Promise<Config>;
export async function getConfig(opts?: any): Promise<Config | null> {
  if (configCache != null) {
    return configCache;
  }

  let configDir: string;
  if (isDevelopment()) {
    // Default to project folder
    configDir = process.cwd();
  } else {
    // ~/.config/marker on linux
    configDir = app.getPath("userData");
  }

  const filePath = path.join(configDir, CONFIG_FILE);
  let config: Config = await readFile(filePath, "json");

  if (config == null) {
    if (isDevelopment()) {
      config = {
        dataDirectory: path.join(process.cwd(), "data"),
        windowHeight: DEFAULT_WINDOW_HEIGHT,
        windowWidth: DEFAULT_WINDOW_WIDTH,
      };
      await writeFile(process.cwd(), config, "json");
    }
  }

  if (config == null && opts?.required) {
    throw new NotFoundError(`No config file was found (path: ${filePath})`);
  }

  configCache = config;
  return config;
}
