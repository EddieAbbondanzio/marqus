import {
  configIpcPlugin,
  CONFIG_FILE,
  DEFAULT_DEV_NOTE_DIRECTORY,
  DEFAULT_DEV_LOG_DIRECTORY,
  getConfig,
  getConfigDirectory,
} from "../../../../src/main/ipc/plugins/config";
import fs from "fs";
import * as env from "../../../../src/shared/env";
import { app, dialog, shell } from "electron";
import { createJsonFile } from "../../../__factories__/json";
import { createConfig } from "../../../__factories__/config";
import { Config } from "../../../../src/shared/domain/config";
import mockFS from "mock-fs";
import { CONFIG_SCHEMAS } from "../../../../src/main/schemas/config";
import { getLatestSchemaVersion } from "../../../../src/main/schemas/utils";
import { FAKE_NOTE_DIRECTORY, initIpc } from "../../../__factories__/ipc";
import { createBrowserWindow } from "../../../__factories__/electron";

afterEach(() => {
  mockFS.restore();
});

test("config.get", async () => {
  const config: Config = {
    version: 4,
    windowHeight: 100,
    windowWidth: 200,
    noteDirectory: FAKE_NOTE_DIRECTORY,
    logDirectory: "logs",
    developerMode: true,
    autoHideAppMenu: true,
  };

  const { ipc } = await initIpc(
    { config: createJsonFile(config) },
    configIpcPlugin,
  );

  const c: Config = await ipc.invoke("config.get");
  expect(c).toMatchObject(config);
});

test("config.openInTextEditor", async () => {
  const { ipc } = await initIpc({}, configIpcPlugin);

  await ipc.invoke("config.openInTextEditor");
  expect(shell.openPath).toHaveBeenCalledWith(
    expect.stringContaining(`seismic-notes-desktop/${CONFIG_FILE}`),
  );
});

test.each([undefined, "fake-data-dir"])(
  "config.openNoteDirectory (noteDirectory: %s)",
  async noteDirectory => {
    if (noteDirectory != null) {
      mockFS({
        [noteDirectory]: {},
      });
    }

    const content = createConfig({
      noteDirectory,
    });
    // Needed to support unsetting it
    content.noteDirectory = noteDirectory;

    const { ipc } = await initIpc(
      {
        config: createJsonFile(content),
      },
      configIpcPlugin,
    );

    await ipc.invoke("config.openNoteDirectory");

    if (noteDirectory != null) {
      expect(shell.openPath).toHaveBeenCalledWith(noteDirectory);
    } else {
      expect(shell.openPath).not.toHaveBeenCalled();
    }
  },
);

test.each([null, ["foo"]])(
  "config.selectNoteDirectory (filePaths: %s)",
  async (filePaths: any) => {
    mockFS({});

    // Hack for jest
    filePaths = filePaths ?? [];

    const browserWindow = createBrowserWindow({
      reload: jest.fn(),
    });

    const { ipc, config } = await initIpc({ browserWindow }, configIpcPlugin);

    (dialog.showOpenDialog as jest.Mock).mockResolvedValueOnce({ filePaths });
    await ipc.invoke("config.selectNoteDirectory");

    expect(dialog.showOpenDialog).toHaveBeenCalledWith(browserWindow, {
      properties: ["openDirectory"],
    });

    if (filePaths.length === 0) {
      expect(config.update).not.toHaveBeenCalled();
    } else {
      expect(config.update).toHaveBeenCalledWith({
        noteDirectory: filePaths[0],
      });
    }
  },
);

test("getConfig overrides note / log directory in development", async () => {
  mockFS({
    [CONFIG_FILE]: JSON.stringify({
      version: getLatestSchemaVersion(CONFIG_SCHEMAS),
      windowHeight: 10,
      windowWidth: 10,
      logDirectory: "random/logs",
      noteDirectory: "random/note-dir",
    }),
    random: {
      "note-dir": {},
      logs: {},
    },
  });

  // We use spyOn instead of mocking entire module because we need getProcessType
  // to function normal.
  jest.spyOn(env, "isDevelopment").mockReturnValue(true);

  const config = await getConfig();
  expect(config.content.noteDirectory).toBe(DEFAULT_DEV_NOTE_DIRECTORY);
  expect(config.content.logDirectory).toBe(DEFAULT_DEV_LOG_DIRECTORY);
});

test("getConfig creates note directory if directory is missing.", async () => {
  mockFS({
    [CONFIG_FILE]: JSON.stringify({
      version: getLatestSchemaVersion(CONFIG_SCHEMAS),
      noteDirectory: "foo",
      logDirectory: "bar",
      windowHeight: 800,
      windowWidth: 600,
    }),
  });

  await getConfig();
  expect(fs.existsSync(CONFIG_FILE)).toBe(true);
});

test("getConfigDirectory", () => {
  // Dev and Test are the same
  jest.spyOn(env, "isProduction").mockReturnValueOnce(true);
  (app.getPath as jest.Mock).mockReturnValueOnce("config-dir");
  expect(getConfigDirectory()).toBe(`config-dir`);

  jest.spyOn(env, "isProduction").mockReturnValueOnce(false);
  jest.spyOn(process, "cwd").mockReturnValueOnce("cwd");
  expect(getConfigDirectory()).toBe("cwd");
});
