import { InvalidOpError, NotFoundError } from "../../shared/errors";
import { IpcRegistry } from "../../shared/ipc";
import { readFile, writeFile } from "../fileSystem";
import { Config } from "../../shared/domain/config";
import { app, BrowserWindow, dialog } from "electron";

import * as path from "path";

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
    config = Object.assign(config ?? {}, { dataDirectory: res.filePaths[0] });

    const userDataDir = app.getPath("userData");
    const filePath = path.join(userDataDir, CONFIG_FILE);
    await writeFile(filePath, config, "json");
    focusedWindow.reload();
  },
};

export async function getConfig(): Promise<Config | null>;
export async function getConfig(opts?: { required: true }): Promise<Config>;
export async function getConfig(opts?: any): Promise<Config | null> {
  const userDataDir = app.getPath("userData");
  const filePath = path.join(userDataDir, CONFIG_FILE);
  console.log("load config at: ", filePath);
  const data = await readFile(filePath, "json");

  if (data == null && opts?.required) {
    throw new NotFoundError("No config file was found");
  }

  return data;
}
