/* eslint-disable react-hooks/rules-of-hooks */
import { app, BrowserWindow, IpcMain, ipcMain, Menu } from "electron";
import { Config } from "../shared/domain/config";
import { getProcessType, isDevelopment } from "../shared/env";
import { useAppIpcs } from "./ipc/app";
import {
  loadConfig,
  saveConfig,
  useConfigIpcs as useConfigIpcs,
} from "./ipc/config";
import { useNoteIpcs } from "./ipc/notes";
import { useShortcutIpcs } from "./ipc/shortcuts";
import { useTagIpcs } from "./ipc/tags";
import { TypeSafeIpc } from "./types";

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

let mainWindow: BrowserWindow;

async function main() {
  const config: Config = await loadConfig();
  const typeSafeIpc: TypeSafeIpc = {
    handle: (ipc, handler) => {
      ipcMain.handle(ipc, (_, args) => handler(args));
    },
  };

  useAppIpcs(typeSafeIpc, config);
  useConfigIpcs(typeSafeIpc, config);
  useShortcutIpcs(typeSafeIpc, config);
  useTagIpcs(typeSafeIpc, config);
  useNoteIpcs(typeSafeIpc, config);

  // Handle creating/removing shortcuts on Windows when installing/uninstalling.
  if (require("electron-squirrel-startup")) {
    app.quit();
  }

  const createWindow = async (): Promise<void> => {
    mainWindow = new BrowserWindow({
      height: config.windowHeight,
      width: config.windowWidth,
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
      config.windowHeight = height;
      config.windowWidth = width;
      await saveConfig(config);
    });
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
main();
