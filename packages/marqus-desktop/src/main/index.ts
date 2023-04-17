import { app, BrowserWindow, ipcMain, session } from "electron";
import { getProcessType, isDevelopment, isTest } from "../shared/env";
import { initPlugins, IpcMainTS, IPC_PLUGINS } from "./ipc";
import { getConfig } from "./ipc/plugins/config";
import { getFileTransport, logger } from "./logger";
import { setCspHeader } from "./utils";

if (!isTest() && getProcessType() !== "main") {
  throw Error(
    "ipcMain is null. Did you accidentally import main.ts in the renderer thread?",
  );
}

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow;
let onDispose: () => Promise<void>;

export async function main(): Promise<void> {
  try {
    const configFile = await getConfig();
    logger.add(getFileTransport(configFile));

    // Handle creating/removing shortcuts on Windows when installing/uninstalling.
    if (require("electron-squirrel-startup")) {
      app.quit();
    }

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("activate", async () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
      }
    });

    // If the app is closed while writing to the file system, we risk corrupting
    // a file so we block it from "closing" by keeping it running in the background
    // until we can finish whatever we were doing.

    // TODO: Fix this because it likely doesn't handle multiple calls at once.
    let keepAlivePromise: Promise<unknown> | undefined;
    const blockAppFromQuitting = async (
      cb: () => Promise<void>,
    ): Promise<void> => {
      keepAlivePromise = cb();
      await keepAlivePromise;
      keepAlivePromise = undefined;
    };

    app.on("before-quit", async ev => {
      if (keepAlivePromise) {
        ev.preventDefault();

        await keepAlivePromise;
        app.quit();
      }
    });

    const createWindow = async (): Promise<void> => {
      // Only allow external images
      session.defaultSession.webRequest.onHeadersReceived(setCspHeader);

      const { windowHeight, windowWidth, autoHideAppMenu } = configFile.content;

      let title = "Marqus";
      if (isDevelopment()) {
        title = `${title} (DEVELOPMENT)`;
      }

      mainWindow = new BrowserWindow({
        // Title must be specified otherwise npm package name will be used until
        // index.html has loaded.
        title,
        icon: "static/icon.png",
        height: windowHeight,
        width: windowWidth,
        autoHideMenuBar: autoHideAppMenu,
        webPreferences: {
          preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
          // Do not change these. They are for security purposes.
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      // Setup ipc modules
      const typeSafeIpc = ipcMain as IpcMainTS;
      const appContext = {
        ipc: typeSafeIpc,
        browserWindow: mainWindow,
        config: configFile,
        blockAppFromQuitting,
        reloadIpcPlugins: async () => {
          if (keepAlivePromise) {
            await keepAlivePromise;
          }

          if (onDispose != null) {
            await onDispose();
          }

          onDispose = await initPlugins(IPC_PLUGINS, typeSafeIpc, appContext);
        },
      };

      onDispose = await initPlugins(IPC_PLUGINS, typeSafeIpc, appContext);

      // and load the index.html of the app.
      await mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

      if (isDevelopment()) {
        mainWindow.webContents.openDevTools();
      }
    };

    // Ready event might fire before we finish loading our config file causing us
    // to miss it.
    // Source: https://github.com/electron/electron/issues/12557
    if (app.isReady()) {
      await createWindow();
    } else {
      app.on("ready", createWindow);
    }
  } catch (err) {
    logger.error("Error: Failed to initialize app.", err);

    mainWindow.webContents.openDevTools();
  }
}

// We don't want to run the app while testing.
if (!isTest()) {
  void main();
}
