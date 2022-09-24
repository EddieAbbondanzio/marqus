import {
  BrowserWindow,
  dialog,
  Menu,
  MenuItemConstructorOptions,
} from "electron";
import { isRoleMenu, Menu as MenuType } from "../shared/ui/menu";
import { IpcChannel, IpcMainTS } from "../shared/ipc";
import { openInBrowser } from "./utils";
import { UIEventType, UIEventInput } from "../shared/ui/events";
import { AppState, DEFAULT_SIDEBAR_WIDTH, Section } from "../shared/ui/app";
import { z } from "zod";
import {
  NoteSort,
  DEFAULT_NOTE_SORTING_ALGORITHM,
} from "../shared/domain/note";
import { JsonFile, loadJsonFile } from "./json";
import { Config } from "../shared/domain/config";
import p from "path";
import { MissingDataDirectoryError } from "../shared/errors";
import { DATE_OR_STRING_SCHEMA } from "../shared/domain";
import { APP_STATE_MIGRATIONS } from "./schemas/appState";

export const APP_STATE_PATH = "ui.json";

export const APP_STATE_SCHEMA = z
  .object({
    version: z.literal(1).optional().default(1),
    sidebar: z
      .object({
        width: z
          .string()
          .regex(/^\d+px$/)
          .optional()
          .default(DEFAULT_SIDEBAR_WIDTH),
        scroll: z.number().optional().default(0),
        hidden: z.boolean().optional(),
        selected: z.array(z.string()).optional(),
        expanded: z.array(z.string()).optional(),
        sort: z
          .nativeEnum(NoteSort)
          .optional()
          .default(DEFAULT_NOTE_SORTING_ALGORITHM),
      })
      .optional()
      .default({}),
    editor: z
      .object({
        isEditing: z.boolean().optional().default(false),
        scroll: z.number().optional().default(0),
        tabs: z
          .array(
            z.object({
              noteId: z.string(),
              // Intentionally omitted noteContent
              lastActive: DATE_OR_STRING_SCHEMA.optional(),
            })
          )
          .default([]),
        tabsScroll: z.number().optional().default(0),
        activeTabNoteId: z.string().optional(),
      })
      .optional()
      .default({}),
    focused: z.array(z.nativeEnum(Section)).default([]),
  })
  .optional()
  .default({
    version: 1,
  });

export function appIpcs(ipc: IpcMainTS, config: JsonFile<Config>): void {
  let appStateFile: JsonFile<AppState>;

  ipc.on("init", async () => {
    if (config.content.dataDirectory == null) {
      throw new MissingDataDirectoryError();
    }

    appStateFile = await loadJsonFile<AppState>(
      p.join(config.content.dataDirectory, APP_STATE_PATH),
      // APP_STATE_SCHEMA,
      // [appStateSchemaV1]
      APP_STATE_MIGRATIONS
    );
  });

  ipc.handle("app.loadAppState", async () => {
    return appStateFile.content;
  });

  ipc.handle("app.saveAppState", async (_, appState) => {
    await appStateFile.update(appState);
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
}

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
