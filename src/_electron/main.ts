"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import path from "path";
import { promptUserHandler } from "./promptUser";
import { fileSystemHandler } from "./fileSystem";
import { IpcType, IpcHandler, IpcArgument } from ".";

const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

/*
 * Register new handlers here. You'll need to update IpcType too
 */
export const handlers: Record<IpcType, IpcHandler<any>> = {
  promptUser: promptUserHandler,
  fileSystem: fileSystemHandler,
};

if (ipcMain == null) {
  throw Error(
    "ipcMain is null. Did you accidentally call main.ts on the renderer thread?"
  );
}

ipcMain.on("send", async (ev, arg: IpcArgument) => {
  const respond = (value: any) =>
    ev.sender.send("send", {
      id: arg.id,
      type: arg.type,
      value,
    });

  const respondError = () =>
    ev.sender.send("send", {
      error: "An error has occured",
    });

  const handler: IpcHandler<any> = handlers[arg.type as IpcType];

  if (handler == null) {
    respondError();

    if (isDevelopment) {
      console.warn("Main recieved ipc: ", arg.type, " but no handler found?");
    }
  }

  try {
    const res = await handler(arg.value);
    respond(res);
  } catch (e) {
    respondError();

    console.error(`Caught error from ipc handler for type "${arg.type}"`, e);
  }
});

async function createWindow() {
  if (isDevelopment) {
    console.log("Creating new electron window.");
    console.log("Node integration: ", process.env.ELECTRON_NODE_INTEGRATION);
    console.log("Context isolation: ", !process.env.ELECTRON_NODE_INTEGRATION);
  }

  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env
        .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", (e as Error).toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
