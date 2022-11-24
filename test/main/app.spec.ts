import { createConfig } from "../__factories__/config";
import { createIpcMainTS } from "../__factories__/ipc";
import {
  appIpcs,
  APP_STATE_DEFAULTS,
  APP_STATE_PATH,
  buildClickHandler,
  buildMenus,
} from "../../src/main/app";
import { createJsonFile } from "../__factories__/json";
import { createLogger } from "../__factories__/logger";
import { BrowserWindow, dialog, Menu, shell } from "electron";
import { openInBrowser } from "../../src/main/utils";
import { Section, serializeAppState } from "../../src/shared/ui/app";
import { createAppState } from "../__factories__/state";
import { uuid } from "../../src/shared/domain";
import mockFS from "mock-fs";
import { createNote, NoteSort } from "../../src/shared/domain/note";
import { IpcChannel } from "../../src/shared/ipc";

afterEach(() => {
  mockFS.restore();
});

jest.mock("../../src/main/utils");

test("app.loadAppState loads", async () => {
  const fakeDataDir = "data";
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
    [fakeDataDir]: {
      [APP_STATE_PATH]: appStateJson,
    },
  });

  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig({ dataDirectory: fakeDataDir }));
  appIpcs(ipc, config, createLogger());
  await ipc.trigger("init");

  const appState = await ipc.invoke("app.loadAppState");
  expect(appState.focused).toEqual([Section.Editor]);

  expect(appState.sidebar.searchString).toBe("foo");
  expect(appState.sidebar.hidden).toBe(false);
  expect(appState.sidebar.scroll).toBe(10);
  expect(appState.sidebar.sort).toBe(NoteSort.DateCreated);
  expect(appState.sidebar.width).toBe("301px");
  expect(appState.sidebar.selected).toEqual(selected);
  expect(appState.sidebar.expanded).toEqual(expanded);

  expect(appState.editor.activeTabNoteId).toBe(activeTabNoteId);
  expect(appState.editor.isEditing).toBe(false);
  expect(appState.editor.scroll).toBe(11);
  expect(appState.editor.tabsScroll).toBe(20);
  expect(appState.editor.tabs).toEqual([expect.objectContaining({ noteId })]);
});

test("app.loadAppState loads defaults", async () => {
  // No ui.json in file system.

  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  appIpcs(ipc, config, createLogger());
  await ipc.trigger("init");

  const appState = await ipc.invoke("app.loadAppState");
  expect(appState).toEqual(APP_STATE_DEFAULTS);
});

test("app.saveAppState", async () => {
  const fakeDataDir = "data";
  mockFS({
    [fakeDataDir]: {
      // Empty dir so defaults apply
    },
  });

  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig({ dataDirectory: fakeDataDir }));
  appIpcs(ipc, config, createLogger());
  await ipc.trigger("init");

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
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  appIpcs(ipc, config, createLogger());

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
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  appIpcs(ipc, config, createLogger());

  const setMenu = jest.fn();
  const focusedWindow = {
    setMenu,
  };
  (BrowserWindow.getFocusedWindow as jest.Mock).mockReturnValue(focusedWindow);

  // Weak test...
  await ipc.invoke("app.setApplicationMenu", []);
  expect(setMenu).toHaveBeenCalled();
});

test("app.promptUser", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  appIpcs(ipc, config, createLogger());

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
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  appIpcs(ipc, config, createLogger());

  const openDevTools = jest.fn();
  const focusedWindow = {
    webContents: {
      openDevTools,
    },
  };

  (BrowserWindow.getFocusedWindow as jest.Mock).mockReturnValue(focusedWindow);

  await ipc.invoke("app.openDevTools");
  expect(openDevTools).toHaveBeenCalled();
});

test("app.reload", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  appIpcs(ipc, config, createLogger());

  const reload = jest.fn();
  const focusedWindow = {
    webContents: {
      reload,
    },
  };

  (BrowserWindow.getFocusedWindow as jest.Mock).mockReturnValue(focusedWindow);

  await ipc.invoke("app.reload");
  expect(reload).toHaveBeenCalled();
});

test("app.toggleFullScreen", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  appIpcs(ipc, config, createLogger());

  const focusedWindow = {
    isFullScreen: jest.fn(),
    setFullScreen: jest.fn(),
  };

  (BrowserWindow.getFocusedWindow as jest.Mock).mockReturnValue(focusedWindow);

  // Windowed -> Full Screen
  focusedWindow.isFullScreen.mockReturnValueOnce(false);
  await ipc.invoke("app.toggleFullScreen");
  expect(focusedWindow.setFullScreen).toHaveBeenCalledWith(true);
  focusedWindow.setFullScreen.mockReset();

  // Full Screen -> Windowed
  focusedWindow.isFullScreen.mockReturnValueOnce(true);
  await ipc.invoke("app.toggleFullScreen");
  expect(focusedWindow.setFullScreen).toHaveBeenCalledWith(false);
});

test("app.quit", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  appIpcs(ipc, config, createLogger());

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
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  appIpcs(ipc, config, createLogger());

  const inspectElement = jest.fn();
  (BrowserWindow.getFocusedWindow as jest.Mock).mockImplementationOnce(() => ({
    webContents: {
      inspectElement,
    },
  }));

  await ipc.invoke("app.inspectElement", { x: 1.23, y: 2.67 });
  expect(inspectElement).toBeCalledWith(1, 3);
});

test("app.openInWebBrowser", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(
    createConfig({
      logDirectory: "foo",
    }),
  );
  appIpcs(ipc, config, createLogger());

  await ipc.invoke("app.openInWebBrowser", "foo.com");
  expect(openInBrowser).toHaveBeenCalledWith("foo.com");
});

test("app.openLogDirectory", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(
    createConfig({
      logDirectory: "foo",
    }),
  );
  appIpcs(ipc, config, createLogger());

  await ipc.invoke("app.openLogDirectory");
  expect(shell.openPath).toHaveBeenCalledWith("foo");
});

test.each([
  [IpcChannel.ApplicationMenuClick, false],
  [IpcChannel.ContextMenuClick, true],
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
    IpcChannel.ContextMenuClick,
  );

  const send = jest.fn();
  const browserWindow = {
    webContents: {
      send,
    },
  } as unknown as Electron.BrowserWindow;

  handler(null!, browserWindow, null!);
  expect(send).toHaveBeenCalledWith(IpcChannel.ContextMenuClick, {
    event: "app.inspectElement",
    eventInput: { x: 0, y: 20 },
  });
});
