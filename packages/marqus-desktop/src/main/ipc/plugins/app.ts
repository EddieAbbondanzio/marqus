import {
  BrowserWindow,
  dialog,
  Menu,
  MenuItemConstructorOptions,
  shell,
} from "electron";
import { isRoleMenu, Menu as MenuType } from "../../../shared/ui/menu";
import { IpcChannel } from "../../../shared/ipc";
import { openInBrowser } from "../../utils";
import { UIEventType, UIEventInput } from "../../../shared/ui/events";
import {
  DEFAULT_SIDEBAR_WIDTH,
  SerializedAppState,
} from "../../../shared/ui/app";

import { JsonFile, loadJsonFile } from "../../json";
import p from "path";
import { NoteSort } from "../../../shared/domain/note";
import { APP_STATE_SCHEMAS } from "../../schemas/appState";
import { IpcPlugin } from "..";
import * as fs from "fs";
import { Config } from "../../../shared/domain/config";
import { getConfigDirectory } from "./config";
import { getLatestSchemaVersion } from "../../schemas/utils";

export const APP_STATE_FILE = "appState.json";
export const APP_STATE_DEFAULTS = {
  version: getLatestSchemaVersion(APP_STATE_SCHEMAS),
  sidebar: {
    scroll: 0,
    sort: NoteSort.Alphanumeric,
    width: DEFAULT_SIDEBAR_WIDTH,
  },
  editor: {
    isEditing: false,
    scroll: 0,
    tabs: [],
    tabsScroll: 0,
  },
  focused: [],
};

let appStateFile: JsonFile<SerializedAppState> | undefined = undefined;

export const appIpcPlugin: IpcPlugin = {
  onInit: async ({ browserWindow, config }) => {
    // We set a non-functional application menu at first so we can make things
    // appear to load smoother visually. Once renderer has started we'll
    // populate it with an actual menu.
    browserWindow.setMenu(
      Menu.buildFromTemplate([
        { label: "File", enabled: false },
        { label: "Edit", enabled: false },
        { label: "View", enabled: false },
      ]),
    );

    const onResize = async () => {
      const [windowWidth, windowHeight] = browserWindow.getSize();
      await config.update({
        windowHeight,
        windowWidth,
      });
    };

    browserWindow.on("resize", onResize);

    if (config.content.noteDirectory != null) {
      appStateFile = await loadAppState(config.content);
    }

    return () => {
      appStateFile = undefined;
      browserWindow.off("resize", onResize);
    };
  },

  "app.loadAppState": async () => {
    return appStateFile?.content ?? APP_STATE_DEFAULTS;
  },

  "app.saveAppState": async (ctx, appState) => {
    const { blockAppFromQuitting } = ctx;

    await blockAppFromQuitting(async () => {
      if (appStateFile == null) {
        return;
      }

      await appStateFile.update(appState);
    });
  },

  "app.showContextMenu": async (_, menus) => {
    const template: MenuItemConstructorOptions[] = buildMenus(
      menus,
      IpcChannel.ContextMenu,
    );
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
    ``;
  },

  "app.setApplicationMenu": async ({ browserWindow }, menus) => {
    const template: MenuItemConstructorOptions[] = buildMenus(
      menus,
      IpcChannel.ApplicationMenu,
    );
    const menu = Menu.buildFromTemplate(template);
    browserWindow.setMenu(menu);
  },

  "app.promptUser": async (_, opts) => {
    const cancelCount = opts.buttons.filter(b => b.role === "cancel").length;
    const defaultCount = opts.buttons.filter(b => b.role === "default").length;

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
      detail: opts.detail,
      buttons: opts.buttons.map(b => b.text),
    });

    // Return back the button that was selected.
    return opts.buttons[returnVal.response];
  },

  "app.openDevTools": async ({ browserWindow }) => {
    browserWindow.webContents.openDevTools();
  },

  "app.reload": async ({ browserWindow, reloadIpcPlugins }) => {
    // Order is important. We reload ipc plugins BEFORE reloading webpage because
    // once we reload the page we'll start making ipc calls and if the plugins haven't
    // been reloaded by then it may throw missing listener errors, or unintended
    // behavior.
    await reloadIpcPlugins();
    browserWindow.webContents.reload();
  },

  "app.toggleFullScreen": async ({ browserWindow }) => {
    browserWindow.setFullScreen(!browserWindow.isFullScreen());
  },

  "app.quit": async () => {
    BrowserWindow.getAllWindows().forEach(w => w.close());
  },

  "app.inspectElement": async ({ browserWindow }, coord) => {
    if (coord == null) {
      throw new Error("Element to inspect was null.");
    }

    browserWindow.webContents.inspectElement(
      // Coords can come over as floats
      Math.round(coord.x),
      Math.round(coord.y),
    );
  },

  "app.openInWebBrowser": async (_, url) => openInBrowser(url),

  "app.openLogDirectory": async ({ config }) => {
    const err = await shell.openPath(config.content.logDirectory);
    if (err) {
      throw new Error(err);
    }
  },

  "app.toggleAutoHideAppMenu": async ({ browserWindow, config }) => {
    // Toggling autoHideMenuBar has a delay before changes take effect so we
    // trigger immediate results by setting menuBarVisible.
    if (!browserWindow.isMenuBarAutoHide()) {
      browserWindow.autoHideMenuBar = true;
      browserWindow.menuBarVisible = false;

      await config.update({ autoHideAppMenu: true });
    } else {
      browserWindow.autoHideMenuBar = false;
      browserWindow.menuBarVisible = true;

      await config.update({ autoHideAppMenu: false });
    }
  },
};

export async function loadAppState(
  config: Config,
): Promise<JsonFile<SerializedAppState>> {
  if (config.noteDirectory == null) {
    throw new Error(`Cannot load app state without a note directory.`);
  }

  let file: JsonFile<SerializedAppState>;
  const filePath = p.join(getConfigDirectory(), APP_STATE_FILE);

  try {
    file = await loadJsonFile<SerializedAppState>(filePath, APP_STATE_SCHEMAS, {
      defaultContent: APP_STATE_DEFAULTS,
    });
  } catch (err) {
    // App state file can easily be re-generated, so if it fails to load we
    // just nuke it out.
    await fs.promises.unlink(filePath);

    // Generate a new app state file that has been defaulted.
    file = await loadJsonFile<SerializedAppState>(filePath, APP_STATE_SCHEMAS, {
      defaultContent: APP_STATE_DEFAULTS,
    });
  }

  return file;
}

export function buildMenus(
  menus: MenuType[],
  channel: IpcChannel,
): MenuItemConstructorOptions[] {
  // We don't listen for shortcuts in the application menu because we
  // already listen for them in the renderer thread and this will cause
  // them to fire twice.
  const registerAccelerator = channel !== IpcChannel.ApplicationMenu;

  const template: MenuItemConstructorOptions[] = [];

  const recursive = (menu: MenuType, parent?: MenuItemConstructorOptions) => {
    let t: MenuItemConstructorOptions;

    switch (menu.type) {
      case "separator":
        t = { type: "separator" };
        break;

      case "normal":
        t = {
          label: menu.label,
          type: "normal",
          accelerator: menu.shortcut,
          enabled: !menu.disabled,
          registerAccelerator,
        };

        if (isRoleMenu(menu)) {
          t.role = menu.role;
        } else {
          t.click = buildClickHandler(menu.event, menu.eventInput, channel);
        }
        break;

      case "radio":
        t = {
          label: menu.label,
          type: "radio",
          accelerator: menu.shortcut,
          enabled: !menu.disabled,
          checked: menu.checked,
          registerAccelerator,
        };

        if (!menu.checked) {
          t.click = buildClickHandler(menu.event, menu.eventInput, channel);
        }

        break;

      case "checkbox":
        t = {
          label: menu.label,
          type: "checkbox",
          accelerator: menu.shortcut,
          enabled: !menu.disabled,
          checked: menu.checked,
          registerAccelerator,
        };

        // Checkbox menus always trigger the click handler unlike radio button
        // menus.
        t.click = buildClickHandler(menu.event, menu.eventInput, channel);

        break;

      case "submenu":
        t = {
          label: menu.label,
          type: "submenu",
        };

        for (const child of menu.children) {
          if ("hidden" in child && child.hidden) {
            continue;
          }
          recursive(child, t);
        }
        break;
    }

    if (parent != null) {
      parent.submenu ??= [];
      (parent.submenu as MenuItemConstructorOptions[]).push(t);
    } else {
      template.push(t);
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

export function buildClickHandler<Ev extends UIEventType>(
  event: Ev,
  eventInput: UIEventInput<Ev>,
  channel: IpcChannel,
): ClickHandler {
  return (_, browserWindow) => {
    browserWindow?.webContents.send(channel, {
      event,
      eventInput,
    });
  };
}

type ClickHandler = Required<
  Pick<MenuItemConstructorOptions, "click">
>["click"];
