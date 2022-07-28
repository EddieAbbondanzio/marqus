import {
  BrowserWindow,
  dialog,
  Menu,
  MenuItemConstructorOptions,
} from "electron";
import { isRoleMenu, Menu as MenuType } from "../../shared/ui/menu";
import { IpcChannel, IpcPlugin } from "../../shared/ipc";
import { openInBrowser } from "../utils";
import { UIEventType, UIEventInput } from "../../shared/ui/events";
import { AppState } from "../../shared/ui/app";
import { IAppStateRepo } from "./appStateRepo";

export const useAppIpcs: IpcPlugin<IAppStateRepo> = (
  ipc,
  config,
  repo: IAppStateRepo
) => {
  let cachedAppState: AppState;

  ipc.on("init", async () => {
    cachedAppState = await repo.get();
  });

  ipc.handle("app.loadAppState", async () => {
    return cachedAppState;
  });

  ipc.handle("app.saveAppState", async (_, appState) => {
    const updatedAppState = await repo.update(appState);
    cachedAppState = updatedAppState;
  });

  ipc.handle("app.showContextMenu", async (_, menus) => {
    const template: MenuItemConstructorOptions[] = buildMenus(
      menus,
      IpcChannel.ContextMenuClick
    );
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
    ``;
  });

  ipc.handle("app.setApplicationMenu", async (_, menus) => {
    const template: MenuItemConstructorOptions[] = buildMenus(
      menus,
      IpcChannel.ApplicationMenuClick
    );
    const bw = BrowserWindow.getFocusedWindow();
    const menu = Menu.buildFromTemplate(template);
    bw?.setMenu(menu);
  });

  ipc.handle("app.promptUser", async (_, opts) => {
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

  ipc.handle("app.inspectElement", async (_, coord) => {
    if (coord == null) {
      throw new Error("Element to inspect was null.");
    }

    BrowserWindow.getFocusedWindow()?.webContents.inspectElement(
      // Coords can come over as floats
      Math.round(coord.x),
      Math.round(coord.y)
    );
  });

  ipc.handle("app.openInWebBrowser", (_, url) => openInBrowser(url));
};

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
