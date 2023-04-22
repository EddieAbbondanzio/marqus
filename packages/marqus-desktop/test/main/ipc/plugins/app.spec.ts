import { createConfig } from "../../../__factories__/config";
import { initIpc } from "../../../__factories__/ipc";

import { createJsonFile } from "../../../__factories__/json";
import { BrowserWindow, dialog, Menu, shell, WebContents } from "electron";
import { openInBrowser } from "../../../../src/main/utils";
import { Section, serializeAppState } from "../../../../src/shared/ui/app";
import { createAppState } from "../../../__factories__/state";
import { uuid } from "../../../../src/shared/domain";
import mockFS from "mock-fs";
import { createNote, NoteSort } from "../../../../src/shared/domain/note";
import { IpcChannel } from "../../../../src/shared/ipc";
import { createBrowserWindow } from "../../../__factories__/electron";
import {
  appIpcPlugin,
  APP_STATE_DEFAULTS,
  APP_STATE_FILE,
  buildClickHandler,
  buildMenus,
} from "../../../../src/main/ipc/plugins/app";

afterEach(() => {
  mockFS.restore();
});

jest.mock("../../../../src/main/utils");

test("appIpcs sets app menu on start", async () => {
  mockFS({
    foo: {},
  });
  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));

  const { browserWindow } = await initIpc({ config }, appIpcPlugin);
  expect(browserWindow.setMenu).toHaveBeenCalled();
});

test("appIpcs saves config on window resize", async () => {
  mockFS({
    foo: {},
  });

  const on = jest.fn();
  const getSize = jest.fn().mockReturnValueOnce([100, 200]);

  const browserWindow = createBrowserWindow({ on, getSize });
  const config = createJsonFile(
    createConfig({ windowHeight: 50, windowWidth: 75, noteDirectory: "foo" }),
  );
  await initIpc({ browserWindow, config }, appIpcPlugin);
  expect(config.content.windowHeight).toBe(50);
  expect(config.content.windowWidth).toBe(75);

  expect(on).toHaveBeenCalledTimes(1);
  const [ev, cb] = on.mock.calls[0];
  expect(ev).toBe("resize");

  cb();
  expect(config.update).toHaveBeenCalledWith({
    windowWidth: 100,
    windowHeight: 200,
  });
});

test("app.loadAppState loads", async () => {
  const activeTabNoteId = uuid();

  const selected = [uuid()];
  const expanded = [uuid()];

  const noteId = uuid();
  const tabs = [
    {
      note: createNote({ id: noteId, name: "foo" }),
      lastActive: new Date(),
    },
  ];
  const appStateJson = JSON.stringify(
    serializeAppState(
      createAppState({
        focused: [Section.Editor],
        sidebar: {
          searchString: "foo",
          hidden: false,
          scroll: 10,
          sort: NoteSort.DateCreated,
          width: "301px",
          selected,
          expanded,
          // Everything below should be deleted.
          input: {},
          searchResults: [{}],
          searchSelected: "1",
          searchScroll: 100,
        },
        editor: {
          activeTabNoteId,
          isEditing: false,
          scroll: 11,
          tabs,
          tabsScroll: 20,
        },
      }),
    ),
  );

  mockFS({
    [APP_STATE_FILE]: appStateJson,
    foo: {},
  });
  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const { ipc } = await initIpc({ config }, appIpcPlugin);

  const appState = await ipc.invoke("app.loadAppState");
  expect(appState.focused).toEqual([Section.Editor]);

  expect(appState.sidebar.searchString).toBe("foo");
  expect(appState.sidebar.hidden).toBe(false);
  expect(appState.sidebar.scroll).toBe(10);
  expect(appState.sidebar.sort).toBe(NoteSort.DateCreated);
  expect(appState.sidebar.width).toBe("301px");
  expect(appState.sidebar.selected).toEqual(selected);
  expect(appState.sidebar.expanded).toEqual(expanded);
  expect(appState.sidebar.searchResults).toBe(undefined);
  expect(appState.sidebar.searchSelected).toBe(undefined);
  expect(appState.sidebar.searchScroll).toBe(undefined);

  expect(appState.editor.activeTabNoteId).toBe(activeTabNoteId);
  expect(appState.editor.isEditing).toBe(false);
  expect(appState.editor.scroll).toBe(11);
  expect(appState.editor.tabsScroll).toBe(20);
  expect(appState.editor.tabs).toEqual([expect.objectContaining({ noteId })]);
});

test("app.loadAppState loads defaults", async () => {
  // No ui.json in file system.
  mockFS({
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const { ipc } = await initIpc({ config }, appIpcPlugin);

  const appState = await ipc.invoke("app.loadAppState");
  expect(appState).toEqual(APP_STATE_DEFAULTS);
});

test("app.loadAppState handles bad JSON", async () => {
  mockFS({
    [APP_STATE_FILE]: "P{WD{A{DSASD}",
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const { ipc } = await initIpc({ config }, appIpcPlugin);
  const appState = await ipc.invoke("app.loadAppState");
  expect(appState).toEqual(APP_STATE_DEFAULTS);
});

test("app.saveAppState", async () => {
  mockFS({
    [APP_STATE_FILE]: JSON.stringify(createAppState()),
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const { ipc } = await initIpc({ config }, appIpcPlugin);

  const update = serializeAppState(
    createAppState({
      sidebar: {
        scroll: 20,
      },
      editor: {
        isEditing: true,
        scroll: 20,
      },
    }),
  );

  await ipc.invoke("app.saveAppState", update);
  const latest = await ipc.invoke("app.loadAppState");

  expect(latest.sidebar.scroll).toBe(20);
  expect(latest.editor.isEditing).toBe(true);
  expect(latest.editor.scroll).toBe(20);
});

test("app.showContextMenu", async () => {
  mockFS({
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const { ipc } = await initIpc({ config }, appIpcPlugin);
  const menu = {
    popup: jest.fn(),
  };
  (Menu.buildFromTemplate as jest.Mock).mockReturnValue(menu);
  await ipc.invoke("app.showContextMenu", []);

  // Weak test...
  expect(Menu.buildFromTemplate).toHaveBeenCalled();
  expect(menu.popup).toHaveBeenCalled();
});

test("app.setApplicationMenu", async () => {
  mockFS({
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));

  const setMenu = jest.fn();
  const browserWindow = createBrowserWindow({
    setMenu,
  });
  const { ipc } = await initIpc({ browserWindow, config }, appIpcPlugin);

  // Weak test...
  await ipc.invoke("app.setApplicationMenu", []);
  expect(setMenu).toHaveBeenCalled();
});

test("app.promptUser", async () => {
  mockFS({
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const { ipc } = await initIpc({ config }, appIpcPlugin);

  // Throws if multiple cancel buttons
  await expect(async () => {
    await ipc.invoke("app.promptUser", {
      text: "Test prompt",
      buttons: [
        { text: "cancel-1", role: "cancel" },
        { text: "cancel-2", role: "cancel" },
      ],
    });
  });

  // Throws if multiple default buttons
  await expect(async () => {
    await ipc.invoke("app.promptUser", {
      text: "Test prompt",
      buttons: [
        { text: "default-1", role: "default" },
        { text: "default-2", role: "default" },
      ],
    });
  });

  // Return value is index of button selected.
  (dialog.showMessageBox as jest.Mock).mockResolvedValueOnce({ response: 0 });

  // Sets content, and returns back button clicked.
  const button = await ipc.invoke("app.promptUser", {
    title: "Title",
    text: "Text",
    detail: "Detail",
    buttons: [{ text: "Hello!" }, { text: "Goodbye!" }],
  });

  expect(dialog.showMessageBox).toHaveBeenCalledWith({
    title: "Title",
    type: "info",
    message: "Text",
    detail: "Detail",
    buttons: ["Hello!", "Goodbye!"],
  });
  expect(button.text).toBe("Hello!");
});

test("app.openDevTools", async () => {
  mockFS({
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const openDevTools = jest.fn();
  const browserWindow = createBrowserWindow({
    webContents: {
      openDevTools,
    } as unknown as WebContents,
  });
  const { ipc } = await initIpc({ browserWindow, config }, appIpcPlugin);

  await ipc.invoke("app.openDevTools");
  expect(openDevTools).toHaveBeenCalled();
});

test("app.reload", async () => {
  mockFS({
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const reload = jest.fn();
  const browserWindow = createBrowserWindow({
    webContents: {
      reload,
    } as unknown as WebContents,
  });
  const { ipc, reloadIpcPlugins } = await initIpc(
    { browserWindow, config },
    appIpcPlugin,
  );

  await ipc.invoke("app.reload");
  expect(reload).toHaveBeenCalled();
  expect(reloadIpcPlugins).toHaveBeenCalled();
});

test("app.toggleFullScreen", async () => {
  mockFS({
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const browserWindow = createBrowserWindow({
    isFullScreen: jest.fn(),
    setFullScreen: jest.fn(),
  });
  const { ipc } = await initIpc({ browserWindow, config }, appIpcPlugin);

  // Windowed -> Full Screen
  (browserWindow.isFullScreen as jest.Mock).mockReturnValueOnce(false);
  await ipc.invoke("app.toggleFullScreen");
  expect(browserWindow.setFullScreen).toHaveBeenCalledWith(true);
  (browserWindow.setFullScreen as jest.Mock).mockReset();

  // Full Screen -> Windowed
  (browserWindow.isFullScreen as jest.Mock).mockReturnValueOnce(true);
  await ipc.invoke("app.toggleFullScreen");
  expect(browserWindow.setFullScreen).toHaveBeenCalledWith(false);
});

test("app.quit", async () => {
  mockFS({
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const { ipc } = await initIpc({ config }, appIpcPlugin);
  const close = jest.fn();

  (BrowserWindow.getAllWindows as jest.Mock).mockImplementationOnce(() => [
    {
      close,
    },
  ]);

  await ipc.invoke("app.quit");
  expect(close).toHaveBeenCalledTimes(1);
});

test("app.inspectElement rounds floats", async () => {
  mockFS({
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const inspectElement = jest.fn();
  const browserWindow = createBrowserWindow({
    webContents: {
      inspectElement,
    } as unknown as WebContents,
  });
  const { ipc } = await initIpc({ browserWindow, config }, appIpcPlugin);

  await ipc.invoke("app.inspectElement", { x: 1.23, y: 2.67 });
  expect(inspectElement).toBeCalledWith(1, 3);
});

test("app.openInWebBrowser", async () => {
  mockFS({
    foo: {},
  });

  const config = createJsonFile(createConfig({ noteDirectory: "foo" }));
  const { ipc } = await initIpc({ config }, appIpcPlugin);

  await ipc.invoke("app.openInWebBrowser", "foo.com");
  expect(openInBrowser).toHaveBeenCalledWith("foo.com");
});

test("app.openLogDirectory", async () => {
  mockFS({
    foo: {},
    bar: {},
  });

  const { ipc } = await initIpc(
    {
      config: createJsonFile(
        createConfig({
          noteDirectory: "foo",
          logDirectory: "bar",
        }),
      ),
    },
    appIpcPlugin,
  );

  await ipc.invoke("app.openLogDirectory");
  expect(shell.openPath).toHaveBeenCalledWith("bar");
});

test("app.toggleAutoHideAppMenu", async () => {
  mockFS({
    foo: {},
    bar: {},
  });

  const browserWindow = createBrowserWindow({
    isMenuBarAutoHide: jest.fn().mockReturnValueOnce(false),
  });

  const { ipc, config } = await initIpc(
    {
      browserWindow,
      config: createJsonFile(
        createConfig({
          noteDirectory: "foo",
          logDirectory: "bar",
        }),
      ),
    },
    appIpcPlugin,
  );
  expect(config.content.autoHideAppMenu).toBe(undefined);

  // Set it to auto hide
  await ipc.invoke("app.toggleAutoHideAppMenu");
  expect(config.update).toHaveBeenCalledWith({ autoHideAppMenu: true });
  expect(browserWindow.autoHideMenuBar).toBe(true);
  expect(browserWindow.menuBarVisible).toBe(false);

  // Set it to always visible
  (browserWindow.isMenuBarAutoHide as jest.Mock).mockReturnValueOnce(true);
  await ipc.invoke("app.toggleAutoHideAppMenu");
  expect(config.update).toHaveBeenCalledWith({ autoHideAppMenu: false });
  expect(browserWindow.autoHideMenuBar).toBe(false);
  expect(browserWindow.menuBarVisible).toBe(true);
});

test.each([
  [IpcChannel.ApplicationMenu, false],
  [IpcChannel.ContextMenu, true],
])("buildMenus", (channel, registerAccelerator) => {
  // Separator
  expect(
    buildMenus(
      [
        {
          type: "separator",
        },
      ],
      channel,
    ),
  ).toEqual([
    {
      type: "separator",
    },
  ]);

  // Normal menu
  expect(
    buildMenus(
      [
        {
          type: "normal",
          label: "foo",
          shortcut: "ctrl+x",
          disabled: false,
          event: "app.openConfig",
        },
      ],
      channel,
    ),
  ).toEqual([
    expect.objectContaining({
      label: "foo",
      type: "normal",
      accelerator: "ctrl+x",
      enabled: true,
      registerAccelerator,
    }),
  ]);

  // Radio menu
  expect(
    buildMenus(
      [
        {
          type: "radio",
          label: "bar",
          shortcut: "ctrl+y",
          disabled: false,
          event: "app.openDevTools",
        },
      ],
      channel,
    ),
  ).toEqual([
    expect.objectContaining({
      label: "bar",
      type: "radio",
      accelerator: "ctrl+y",
      enabled: true,
      registerAccelerator,
    }),
  ]);

  // Submenu
  expect(
    buildMenus(
      [
        {
          label: "Parent",
          type: "submenu",
          children: [
            {
              label: "Child",
              type: "normal",
              event: "app.reload",
              shortcut: "ctrl+i",
            },
          ],
        },
      ],
      channel,
    ),
  ).toEqual([
    expect.objectContaining({
      label: "Parent",
      type: "submenu",
      submenu: [
        expect.objectContaining({
          label: "Child",
          type: "normal",
          accelerator: "ctrl+i",
          registerAccelerator,
        }),
      ],
    }),
  ]);
});

test("buildClickHandler", () => {
  const handler = buildClickHandler(
    "app.inspectElement",
    { x: 0, y: 20 },
    IpcChannel.ContextMenu,
  );

  const send = jest.fn();
  const browserWindow = {
    webContents: {
      send,
    },
  } as unknown as Electron.BrowserWindow;

  handler(null!, browserWindow, null!);
  expect(send).toHaveBeenCalledWith(IpcChannel.ContextMenu, {
    event: "app.inspectElement",
    eventInput: { x: 0, y: 20 },
  });
});
