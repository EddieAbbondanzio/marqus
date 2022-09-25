import { app, BrowserWindow, ipcMain, Menu, session } from "electron";
import { getProcessType, isDevelopment, isTest } from "../shared/env";
import { IpcMainTS } from "../shared/ipc";
import { appIpcs } from "./app";
import { configIpcs, getConfig } from "./config";
import { noteIpcs } from "./notes";
import { openInBrowser } from "./utils";

import { shortcutIpcs } from "./shortcuts";
import { getLogger, logIpcs } from "./log";

if (!isTest() && getProcessType() !== "main") {
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

export async function main(): Promise<void> {
  const configFile = await getConfig();
  const log = await getLogger(configFile, console);

  const typeSafeIpc = ipcMain as IpcMainTS;
  logIpcs(typeSafeIpc, configFile, log);
  configIpcs(typeSafeIpc, configFile, log);
  appIpcs(typeSafeIpc, configFile, log);
  shortcutIpcs(typeSafeIpc, configFile, log);
  noteIpcs(typeSafeIpc, configFile, log);

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

  app.on("quit", () => {
    // Use console.log() over log.info to avoid appending this to the log file
    // eslint-disable-next-line no-console
    console.log(`Shutting down. Log saved to: ${log.filePath}`);
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
