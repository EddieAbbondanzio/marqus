import {
  configIpcs,
  CONFIG_FILE,
  DEFAULT_DEV_DATA_DIRECTORY,
  DEFAULT_DEV_LOG_DIRECTORY,
  getConfig,
  getConfigPath,
} from "../../../src/main/ipcs/config";
import fsp from "fs/promises";
import fs from "fs";
import * as env from "../../../src/shared/env";
import { app, BrowserWindow, dialog, shell } from "electron";
import { createIpcMainTS } from "../../__factories__/ipc";
import { createJsonFile } from "../../__factories__/json";
import { createConfig } from "../../__factories__/config";
import { createLogger } from "../../__factories__/logger";
import { Config } from "../../../src/shared/domain/config";
import { loadJsonFile } from "../../../src/main/json";
import mockFS from "mock-fs";
import { CONFIG_SCHEMAS } from "../../../src/main/schemas/config";
import { getLatestSchemaVersion } from "../../../src/main/schemas/utils";

afterEach(() => {
  mockFS.restore();
});

test("config.get", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(
    createConfig({ dataDirectory: "foo", developerMode: true }),
  );
  configIpcs(ipc, config, createLogger());

  const c: Config = await ipc.invoke("config.get");
  expect(c.dataDirectory).toBe("foo");
  expect(c.developerMode).toBe(true);
});

test("config.openInTextEditor", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(
    createConfig({ dataDirectory: "foo", developerMode: true }),
  );
  configIpcs(ipc, config, createLogger());

  await ipc.invoke("config.openInTextEditor");
  expect(shell.openPath).toHaveBeenCalledWith(CONFIG_FILE);
});

test.each([null, "fake-data-dir"])(
  "config.openDataDirectory (dataDirectory: %s)",
  async dataDirectory => {
    const ipc = createIpcMainTS();
    const config = createJsonFile(
      createConfig({ dataDirectory, developerMode: true }),
    );
    configIpcs(ipc, config, createLogger());

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
    // Hack for jest
    filePaths = filePaths ?? [];

    const ipc = createIpcMainTS();
    const config = createJsonFile(
      createConfig({ dataDirectory: null, developerMode: true }),
    );

    const focusedWindow = {
      reload: jest.fn(),
    };
    (BrowserWindow.getFocusedWindow as jest.Mock).mockReturnValueOnce(
      focusedWindow,
    );
    (dialog.showOpenDialog as jest.Mock).mockResolvedValueOnce({ filePaths });
    configIpcs(ipc, config, createLogger());
    await ipc.invoke("config.selectDataDirectory");

    expect(dialog.showOpenDialog).toHaveBeenCalledWith(focusedWindow, {
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
  jest.spyOn(process, "cwd").mockReturnValueOnce("foo");
  jest.spyOn(env, "isDevelopment").mockReturnValueOnce(true);
  expect(getConfigPath()).toBe("foo/config.json");

  jest.spyOn(env, "isDevelopment").mockReturnValueOnce(false);
  jest.spyOn(env, "isTest").mockReturnValueOnce(true);
  expect(getConfigPath()).toBe(CONFIG_FILE);

  jest.spyOn(env, "isDevelopment").mockReturnValueOnce(false);
  jest.spyOn(env, "isTest").mockReturnValueOnce(false);

  (app.getPath as jest.Mock).mockReturnValueOnce("config-dir");
  expect(getConfigPath()).toBe("config-dir/config.json");
});
