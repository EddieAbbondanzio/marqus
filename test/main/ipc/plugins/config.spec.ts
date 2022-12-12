import {
  configIpcPlugin,
  CONFIG_FILE,
  DEFAULT_DEV_DATA_DIRECTORY,
  DEFAULT_DEV_LOG_DIRECTORY,
  getConfig,
  getConfigPath,
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
import { FAKE_DATA_DIRECTORY, initIpc } from "../../../__factories__/ipc";
import { createBrowserWindow } from "../../../__factories__/electron";

afterEach(() => {
  mockFS.restore();
});

test("config.get", async () => {
  const config: Config = {
    version: 4,
    windowHeight: 100,
    windowWidth: 200,
    dataDirectory: FAKE_DATA_DIRECTORY,
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
  expect(shell.openPath).toHaveBeenCalledWith(CONFIG_FILE);
});

test.each([null, "fake-data-dir"])(
  "config.openDataDirectory (dataDirectory: %s)",
  async dataDirectory => {
    mockFS({
      [dataDirectory]: {},
    });

    const { ipc } = await initIpc(
      {
        config: createJsonFile(
          createConfig({
            dataDirectory,
          }),
        ),
      },
      configIpcPlugin,
    );

    await ipc.invoke("config.openDataDirectory");

    if (dataDirectory != null) {
      expect(shell.openPath).toHaveBeenCalledWith(dataDirectory);
    } else {
      expect(shell.openPath).not.toHaveBeenCalled();
    }
  },
);

test.each([null, ["foo"]])(
  "config.selectDataDirectory (filePaths: %s)",
  async (filePaths: any) => {
    mockFS({});

    // Hack for jest
    filePaths = filePaths ?? [];

    const browserWindow = createBrowserWindow({
      reload: jest.fn(),
    });

    const { ipc, config } = await initIpc({ browserWindow }, configIpcPlugin);

    (dialog.showOpenDialog as jest.Mock).mockResolvedValueOnce({ filePaths });
    await ipc.invoke("config.selectDataDirectory");

    expect(dialog.showOpenDialog).toHaveBeenCalledWith(browserWindow, {
      properties: ["openDirectory"],
    });

    if (filePaths.length === 0) {
      expect(config.update).not.toHaveBeenCalled();
    } else {
      expect(config.update).toHaveBeenCalledWith({
        dataDirectory: filePaths[0],
      });
    }
  },
);

test("getConfig overrides data / log directory in development", async () => {
  mockFS({
    [CONFIG_FILE]: JSON.stringify({
      version: getLatestSchemaVersion(CONFIG_SCHEMAS),
      windowHeight: 10,
      windowWidth: 10,
      logDirectory: "random/logs",
      dataDirectory: "random/data-dir",
    }),
  });

  // We use spyOn instead of mocking entire module because we need getProcessType
  // to function normal.
  jest.spyOn(env, "isDevelopment").mockReturnValue(true);

  const config = await getConfig();
  expect(config.content.dataDirectory).toBe(DEFAULT_DEV_DATA_DIRECTORY);
  expect(config.content.logDirectory).toBe(DEFAULT_DEV_LOG_DIRECTORY);
});

test("getConfig creates data directory if directory is missing.", async () => {
  mockFS({
    [CONFIG_FILE]: JSON.stringify({
      version: getLatestSchemaVersion(CONFIG_SCHEMAS),
      dataDirectory: "foo",
      logDirectory: "bar",
      windowHeight: 800,
      windowWidth: 600,
    }),
  });

  await getConfig();
  expect(fs.existsSync(CONFIG_FILE)).toBe(true);
});

test("getConfigPath", () => {
  jest.spyOn(process, "cwd").mockReturnValueOnce(FAKE_DATA_DIRECTORY);
  jest.spyOn(env, "isDevelopment").mockReturnValueOnce(true);
  expect(getConfigPath()).toBe(`${FAKE_DATA_DIRECTORY}/config.json`);

  jest.spyOn(env, "isDevelopment").mockReturnValueOnce(false);
  jest.spyOn(env, "isTest").mockReturnValueOnce(true);
  expect(getConfigPath()).toBe(CONFIG_FILE);

  jest.spyOn(env, "isDevelopment").mockReturnValueOnce(false);
  jest.spyOn(env, "isTest").mockReturnValueOnce(false);

  (app.getPath as jest.Mock).mockReturnValueOnce("config-dir");
  expect(getConfigPath()).toBe("config-dir/config.json");
});
