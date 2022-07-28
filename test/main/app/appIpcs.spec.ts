import { createConfig } from "../../__factories__/config";
import { useAppIpcs } from "../../../src/main/app/appIpcs";
import { createIpcMainTS } from "../../__factories__/ipc";
import * as json from "../../../src/main/json";
import { AppStateRepo } from "../../../src/main/app/appStateRepo";
import { initPlugins } from "../../../src/main";
import { DEFAULT_SIDEBAR_WIDTH } from "../../../src/shared/ui/app";
import { DEFAULT_NOTE_SORTING_ALGORITHM } from "../../../src/shared/domain/note";
import * as fileSystem from "../../../src/main/fileSystem";

const inspectElement = jest.fn();
jest.mock("electron", () => {
  return {
    BrowserWindow: {
      getFocusedWindow: () => ({
        webContents: {
          inspectElement,
        },
      }),
    },
  };
});

const loadAndMigrateJson = jest.spyOn(json, "loadAndMigrateJson");
jest.spyOn(fileSystem, "writeFile");

test("app.loadAppState sets default values", async () => {
  const ipc = createIpcMainTS();
  const config = createConfig();
  useAppIpcs(ipc, config, new AppStateRepo(config));

  // Rest of config will be defaulted.
  loadAndMigrateJson.mockResolvedValueOnce({
    version: 1,
  });

  await initPlugins(ipc);

  const appState = await ipc.invoke("app.loadAppState");

  expect(appState.sidebar).toEqual({
    width: DEFAULT_SIDEBAR_WIDTH,
    scroll: 0,
    sort: DEFAULT_NOTE_SORTING_ALGORITHM,
  });
  expect(appState.editor).toEqual({
    isEditting: false,
    scroll: 0,
    tabs: [],
    tabsScroll: 0,
  });
  expect(appState.focused).toEqual([]);
});

test("app.loadAppState omits undesirable values", async () => {
  const ipc = createIpcMainTS();
  const config = createConfig();
  useAppIpcs(ipc, config, new AppStateRepo(config));

  // Rest of config will be defaulted.
  loadAndMigrateJson.mockResolvedValueOnce({
    version: 1,
    sidebar: {
      searchString: "foo",
      input: {},
    },
    editor: {
      tabs: [{ noteId: "1", lastActive: new Date(), noteContent: "foo" }],
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  await initPlugins(ipc);

  const appState = await ipc.invoke("app.loadAppState");
  expect(appState.sidebar.searchString).toBe(undefined);
  expect(appState.sidebar.input).toBe(undefined);
  expect(appState.editor.tabs[0].noteContent).toBe(undefined);
});

test("app.inspectElement rounds floats", async () => {
  const ipc = createIpcMainTS();
  const config = createConfig();
  useAppIpcs(ipc, config);

  await ipc.invoke("app.inspectElement", { x: 1.23, y: 2.67 });
  expect(inspectElement).toBeCalledWith(1, 3);
});

test("app.inspectElement throws", async () => {
  const ipc = createIpcMainTS();
  const config = createConfig();
  useAppIpcs(ipc, config);

  expect(async () => {
    await ipc.invoke("app.inspectElement", undefined!);
  }).rejects.toThrow();
});
