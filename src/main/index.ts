import { app, BrowserWindow, ipcMain, Menu, session } from "electron";
import { getProcessType, isDevelopment, isTest } from "../shared/env";
import { IpcMainTS } from "../shared/ipc";
import { appIpcs } from "./app";
import { configIpcs, CONFIG_SCHEMA } from "./config";
import { noteIpcs } from "./notes";
import { openInBrowser } from "./utils";
import * as path from "path";
import * as fs from "fs";
import * as fsp from "fs/promises";
import { loadJsonFile } from "./json";
import { CONFIG_MIGRATIONS } from "./migrations/config";
import { Config } from "../shared/domain/config";
import { shortcutIpcs } from "./shortcuts";

if (getProcessType() !== "main") {
  throw Error(
    "ipcMain is null. Did you accidentally import main.ts in the renderer thread?"
  );
}

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const CONFIG_FILE = "config.json";
export const DEFAULT_DEV_DATA_DIRECTORY = "data";
export const DEFAULT_WINDOW_HEIGHT = 600;
export const DEFAULT_WINDOW_WIDTH = 800;

let mainWindow: BrowserWindow;

export async function main(): Promise<void> {
  const configFile = await loadJsonFile<Config>(
    getConfigPath(),
    CONFIG_SCHEMA,
    CONFIG_MIGRATIONS
  );

  if (isDevelopment() && configFile.content.dataDirectory == null) {
    await configFile.update({ dataDirectory: DEFAULT_DEV_DATA_DIRECTORY });
  }

  // Always check if we need to recreate the data directory on start. It may have
  // been deleted to clear out notes.
  if (
    configFile.content.dataDirectory != null &&
    !fs.existsSync(configFile.content.dataDirectory)
  ) {
    await fsp.mkdir(configFile.content.dataDirectory);
  }

  const typeSafeIpc = ipcMain as IpcMainTS;

  configIpcs(typeSafeIpc, configFile);
  appIpcs(typeSafeIpc, configFile);
  shortcutIpcs(typeSafeIpc, configFile);
  noteIpcs(typeSafeIpc, configFile);

  // Handle creating/removing shortcuts on Windows when installing/uninstalling.
  if (require("electron-squirrel-startup")) {
    app.quit();
  }

  const createWindow = async (): Promise<void> => {
    await initPlugins(typeSafeIpc);

    // Only allow external images
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: Object.assign(
          {
            ...details.responseHeaders,
            "Content-Security-Policy": ["img-src *"],
          },
          details.responseHeaders
        ),
      });
    });

    let { windowHeight, windowWidth } = configFile.content;
    mainWindow = new BrowserWindow({
      height: windowHeight,
      width: windowWidth,
      icon: "static/icon.png",
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        // Do not change these. They are for security purposes.
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    if (isDevelopment()) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.on("resize", async () => {
      const [width, height] = mainWindow.getSize();
      windowHeight = height;
      windowWidth = width;

      await configFile.update({
        windowHeight,
        windowWidth,
      });
    });

    // Override how all links are open so we can send them off to the user's
    // web browser instead of opening them in the electron app.
    mainWindow.webContents.setWindowOpenHandler((details) => {
      openInBrowser(details.url);
      return { action: "deny" };
    });

    // We set a non-functional application menu at first so we can make things
    // appear to load smoother visually. Once renderer has started we'll
    // populate it with an actual menu.
    mainWindow.setMenu(
      Menu.buildFromTemplate([
        { label: "File", enabled: false },
        { label: "Edit", enabled: false },
        { label: "View", enabled: false },
      ])
    );
  };

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Ready event might fire before we finish loading our config file causing us
  // to miss it.
  // Source: https://github.com/electron/electron/issues/12557
  if (app.isReady()) {
    createWindow();
  } else {
    app.on("ready", createWindow);
  }
}

// We don't want to run the app while testing.
if (!isTest()) {
  main();
}

export async function initPlugins(typeSafeIpc: IpcMainTS): Promise<unknown> {
  const initListeners = typeSafeIpc.listeners("init");
  return await Promise.all(initListeners.map((l) => l()));
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
