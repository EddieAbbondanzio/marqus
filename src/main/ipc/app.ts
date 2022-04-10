import { BrowserWindow, dialog, IpcMain } from "electron";
import { UI } from "../../shared/domain/ui";
import { IpcHandler, IpcRegistry } from "../../shared/ipc";
import * as yup from "yup";
import { px } from "../../renderer/utils/dom";
import {
  createFileHandler,
  FileHandler,
  FileHandlerOpts,
  getPathInDataDirectory,
} from "../fileHandler";
import { IpcPlugin } from "../types";
import { Config } from "../../shared/domain/config";

export const UI_FILE = "ui.json";

export const useAppIpcs: IpcPlugin = (ipc, config) => {
  ipc.handle("app.promptUser", async (opts) => {
    const cancelCount = opts.buttons.filter((b) => b.role === "cancel").length;
    const defaultCount = opts.buttons.filter(
      (b) => b.role === "default"
    ).length;

    if (cancelCount > 1) {
      throw Error(`${cancelCount} cancel buttons found.`);
    }

    if (defaultCount > 1) {
      throw Error(`${defaultCount} default buttons found.`);
    }

    const returnVal = await dialog.showMessageBox({
      title: opts.title,
      type: opts.type ?? "info",
      message: opts.text,
      buttons: opts.buttons.map((b) => b.text),
    });

    // Return back the button that was selected.
    return opts.buttons[returnVal.response];
  });

  ipc.handle("app.openDevTools", async () => {
    BrowserWindow.getFocusedWindow()?.webContents.openDevTools();
  });

  ipc.handle("app.reload", async () => {
    BrowserWindow.getFocusedWindow()?.webContents.reload();
  });

  ipc.handle("app.toggleFullScreen", async () => {
    const bw = BrowserWindow.getFocusedWindow();
    if (bw == null) {
      return;
    }

    bw.setFullScreen(!bw.isFullScreen());
  });

  ipc.handle("app.quit", async () => {
    BrowserWindow.getAllWindows().forEach((w) => w.close());
  });

  ipc.handle("app.inspectElement", async (coord) => {
    BrowserWindow.getFocusedWindow()?.webContents.inspectElement(
      coord.x,
      coord.y
    );
  });

  ipc.handle("app.loadPreviousUIState", () => getUIFileHandler(config).load());
  ipc.handle("app.saveUIState", async (app) => {
    await getUIFileHandler(config).save(app);
  });
};

export function getUIFileHandler(config: Config): FileHandler<UI> {
  return createFileHandler<UI>(
    getPathInDataDirectory(config, UI_FILE),
    appSchema,
    {
      serialize: (ui) => {
        // Nuke out stuff we don't want to persist.
        ui.sidebar.input = undefined;
        ui.focused = undefined!;

        return ui;
      },
      deserialize: (ui) => {
        if (ui == null) {
          return;
        }

        ui.sidebar.input = undefined;
        ui.focused = [];
        return ui;
      },
      defaultValue: {
        sidebar: {
          hidden: false,
          width: px(300),
          scroll: 0,
        },
        editor: {
          isEditting: false,
        },
        focused: [],
      },
    }
  );
}

const appSchema = yup.object().shape({
  sidebar: yup.object().shape({
    width: yup.string().required(),
    scroll: yup.number().required().min(0),
    hidden: yup.boolean().optional(),
    filter: yup.object().shape({
      expanded: yup.boolean().optional(),
    }),
  }),
});
