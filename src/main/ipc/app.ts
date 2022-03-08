import { BrowserWindow, dialog, IpcMain } from "electron";
import { UI } from "../../shared/domain/state";
import { IpcHandler, IpcRegistry } from "../../shared/ipc";
import * as yup from "yup";
import { px } from "../../shared/dom";
import { createFileHandler } from "../fileSystem";

const promptUser: IpcHandler<"app.promptUser"> = async (opts) => {
  const cancelCount = opts.buttons.filter((b) => b.role === "cancel").length;
  const defaultCount = opts.buttons.filter((b) => b.role === "default").length;

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
};

const openDevTools: IpcHandler<"app.openDevTools"> = async () => {
  BrowserWindow.getFocusedWindow()?.webContents.openDevTools();
};

const reload: IpcHandler<"app.reload"> = async () => {
  BrowserWindow.getFocusedWindow()?.webContents.reload();
};

const toggleFullScreen: IpcHandler<"app.toggleFullScreen"> = async () => {
  const bw = BrowserWindow.getFocusedWindow();
  if (bw == null) {
    return;
  }

  bw.setFullScreen(!bw.isFullScreen());
};

const quit: IpcHandler<"app.quit"> = async () => {
  BrowserWindow.getAllWindows().forEach((w) => w.close());
};

const inspectElement: IpcHandler<"app.inspectElement"> = async (coord) => {
  BrowserWindow.getFocusedWindow()?.webContents.inspectElement(
    coord.x,
    coord.y
  );
};

export async function load(): Promise<UI> {
  return uiFile.load();
}

export async function save(app: UI): Promise<void> {
  console.log("Save: ", app);
  await uiFile.save(app);
}

export const appIpcs: IpcRegistry<"app"> = {
  "app.promptUser": promptUser,
  "app.openDevTools": openDevTools,
  "app.reload": reload,
  "app.toggleFullScreen": toggleFullScreen,
  "app.quit": quit,
  "app.inspectElement": inspectElement,
  "app.loadPreviousUIState": load,
  "app.saveUIState": save,
};

const appSchema = yup.object().shape({
  sidebar: yup.object().shape({
    width: yup.string().required(),
    scroll: yup.number().required().min(0),
    hidden: yup.boolean().optional(),
    filter: yup.object().shape({
      expanded: yup.boolean().optional(),
    }),
    explorer: yup.object().shape({
      view: yup
        .mixed()
        .oneOf(["all", "notebooks", "tags", "favorites", "temp", "trash"])
        .required(),
    }),
  }),
});

export const uiFile = createFileHandler<UI>("ui.json", appSchema, {
  serialize: (ui) => {
    // Nuke out stuff we don't want to persist.
    ui.sidebar.explorer.input = undefined;
    ui.sidebar.explorer.selected = undefined;
    ui.focused = undefined!;

    return ui;
  },
  deserialize: (ui) => {
    if (ui == null) {
      return;
    }

    ui.sidebar.explorer.input = undefined;
    ui.sidebar.explorer.selected = undefined;
    ui.focused = [];
    return ui;
  },
  defaultValue: {
    sidebar: {
      hidden: false,
      width: px(300),
      scroll: 0,
      filter: {},
      explorer: {
        view: "notebooks",
      },
    },
    editor: {
      isEditting: false,
    },
    focused: [],
  },
});
