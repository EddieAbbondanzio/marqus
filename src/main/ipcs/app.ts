import {
  BrowserWindow,
  dialog,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  shell,
} from "electron";
import { isRoleMenu, Menu as MenuType } from "../../shared/ui/menu";
import * as yup from "yup";
import { createFileHandler, FileHandler } from "../fileHandler";
import { Config } from "../../shared/domain/config";
import { IpcChannel, IpcPlugin } from "../../shared/ipc";
import { openInBrowser } from "../utils";
import { DEFAULT_NOTE_SORTING_ALGORITHM } from "../../shared/domain/note";
import { UIEventType, UIEventInput } from "../../shared/ui/events";
import { EditorTab, UI } from "../../shared/ui/app";
import { parseJSON } from "date-fns";

export const UI_FILE = "ui.json";

export const useAppIpcs: IpcPlugin = (ipc, config) => {
  ipc.handle("app.showContextMenu", async (menus) => {
    const template: MenuItemConstructorOptions[] = buildMenus(
      menus,
      IpcChannel.ContextMenuClick
    );
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
    ``;
  });

  ipc.handle("app.setApplicationMenu", async (menus) => {
    const template: MenuItemConstructorOptions[] = buildMenus(
      menus,
      IpcChannel.ApplicationMenuClick
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
      throw new Error("Element to inspect was null.");
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

  ipc.handle("app.openInWebBrowser", openInBrowser);
};

export function getUIFileHandler(config: Config): FileHandler<UI> {
  return createFileHandler<UI>(config.getPath(UI_FILE), appSchema, {
    serialize: (ui) => {
      // Nuke out stuff we don't want to persist.
      ui.sidebar.input = undefined;
      ui.focused = undefined!;

      if (ui.editor.tabs != null) {
        for (const tab of ui.editor.tabs) {
          tab.noteContent = undefined!;
        }
      }

      return ui;
    },
    deserialize: (ui) => {
      if (ui == null) {
        return;
      }

      ui.sidebar.input = undefined;
      ui.focused = [];

      ui.editor ??= {};
      ui.editor.tabs ??= [];
      for (const tab of ui.editor.tabs) {
        tab.model = undefined;
        tab.viewState = undefined;
        tab.lastActive = parseJSON(tab.lastActive);
      }

      // Check if active tab is stale.
      if (
        ui.editor.activeTabNoteId != null &&
        ui.editor.tabs.every(
          (t: EditorTab) => t.noteId != ui.editor.activeTabNoteId
        )
      ) {
        ui.editor.activeTabNoteId = undefined;
      }

      return ui;
    },
    defaultValue: {
      sidebar: {
        hidden: false,
        width: "300px",
        scroll: 0,
        sort: DEFAULT_NOTE_SORTING_ALGORITHM,
      },
      editor: {
        tabs: [],
        tabsScroll: 0,
        isEditting: false,
        scroll: 0,
      },
      focused: [],
    },
  });
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
  channel: IpcChannel
): MenuItemConstructorOptions[] {
  // We don't listen for shortcuts in the application menu because we
  // already listen for them in the renderer thread and this will cause
  // them to fire twice.
  const registerAccelerator = channel !== IpcChannel.ApplicationMenuClick;

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

      case "submenu":
        t = {
          label: menu.label,
          type: "submenu",
        };
        break;
    }

    if (parent != null) {
      parent.submenu ??= [];
      (parent.submenu as MenuItemConstructorOptions[]).push(t);
    } else {
      template.push(t);
    }

    if (menu.type === "submenu") {
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

export function buildClickHandler<Ev extends UIEventType>(
  event: Ev,
  eventInput: UIEventInput<Ev>,
  channel: IpcChannel
): MenuItemConstructorOptions["click"] {
  return (_, browserWindow) => {
    browserWindow?.webContents.send(channel, {
      event,
      eventInput,
    });
  };
}
