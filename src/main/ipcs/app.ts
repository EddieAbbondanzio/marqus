import {
  BrowserWindow,
  dialog,
  Menu,
  MenuItemConstructorOptions,
  shell,
} from "electron";
import {
  Menu as MenuType,
  isSeperator,
  menuHasChildren,
  menuHasEvent,
  menuHasRole,
  UI,
} from "../../shared/domain/ui";
import * as yup from "yup";
import { px } from "../../shared/dom";
import {
  createFileHandler,
  FileHandler,
  getPathInDataDirectory,
} from "../fileHandler";
import { Config } from "../../shared/domain/config";
import { IpcChannels, IpcPlugin } from "../../shared/ipc";
import { isEmpty } from "lodash";
import { InvalidOpError } from "../../shared/errors";

export const UI_FILE = "ui.json";

export const useAppIpcs: IpcPlugin = (ipc, config) => {
  ipc.handle("app.showContextMenu", async (menus) => {
    const template: MenuItemConstructorOptions[] = buildMenus(
      menus,
      IpcChannels.ContextMenuClick
    );
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  });

  ipc.handle("app.setApplicationMenu", async (menus) => {
    const template: MenuItemConstructorOptions[] = buildMenus(
      menus,
      IpcChannels.ApplicationMenuClick
    );
    const bw = BrowserWindow.getFocusedWindow();
    const menu = Menu.buildFromTemplate(template);
    bw?.setMenu(menu);
  });

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
    if (coord == null) {
      throw new InvalidOpError("Element to inspect was null.");
    }

    BrowserWindow.getFocusedWindow()?.webContents.inspectElement(
      // Coords can come over as floats
      Math.round(coord.x),
      Math.round(coord.y)
    );
  });

  ipc.handle("app.loadPreviousUIState", () => getUIFileHandler(config).load());
  ipc.handle("app.saveUIState", async (app) => {
    await getUIFileHandler(config).save(app);
  });

  ipc.handle("app.openInWebBrowser", async (url) => {
    if (!url.startsWith("http")) {
      url = `http://${url}`;
    }
    shell.openExternal(url);
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
          scroll: 0,
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

export function buildMenus(
  menus: MenuType[],
  channel: IpcChannels
): MenuItemConstructorOptions[] {
  const template: MenuItemConstructorOptions[] = [];

  const recursive = (menu: MenuType, parent?: MenuItemConstructorOptions) => {
    let t: MenuItemConstructorOptions;
    if (isSeperator(menu)) {
      t = { type: menu.type };
    } else {
      t = {
        label: menu.label,
        enabled: !(menu.disabled ?? false),
      };
    }

    if (menuHasRole(menu)) {
      t.role = menu.role;
      // shortcut will be defaulted from device settings.
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!menuHasChildren(menu) && menuHasEvent(menu)) {
      t.click = (item, browserWindow, event) => {
        // We don't listen for shortcuts in the application menu because we
        // already listen for them in the renderer thread and this will cause
        // them to fire twice.
        if (
          event.triggeredByAccelerator &&
          channel === IpcChannels.ApplicationMenuClick
        ) {
          return;
        }

        const bw = BrowserWindow.getFocusedWindow();
        bw?.webContents.send(channel, {
          event: menu.event,
          eventInput: menu.eventInput,
        });
      };
      t.accelerator = menu.shortcut;
    }

    if (parent != null) {
      parent.submenu ??= [];
      (parent.submenu as MenuItemConstructorOptions[]).push(t);
    } else {
      template.push(t);
    }

    if (menuHasChildren(menu) && !isEmpty(menu.children)) {
      for (const child of menu.children) {
        if ("hidden" in child && child.hidden) {
          continue;
        }
        recursive(child, t);
      }
    }
  };

  for (const menu of menus) {
    if ("hidden" in menu && menu.hidden) {
      continue;
    }

    recursive(menu);
  }

  return template;
}
