import {
  configIpcs,
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

jest.mock("fs/promises");
jest.mock("fs");
jest.mock("../../../src/main/json");

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
  expect(shell.openPath).toHaveBeenCalledWith("");
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
  const update = jest.fn();

  (loadJsonFile as jest.Mock).mockResolvedValueOnce({
    content: {
      dataDirectory: null,
      windowHeight: 800,
      windowWidth: 600,
    },
    update,
  });

  // We use spyOn instead of mocking entire module because we need getProcessType
  // to function normal.
  jest.spyOn(env, "isDevelopment").mockReturnValue(true);

  await getConfig();
  expect(update).toHaveBeenCalledWith({
    dataDirectory: DEFAULT_DEV_DATA_DIRECTORY,
    logDirectory: DEFAULT_DEV_LOG_DIRECTORY,
  });
});

test("getConfig creates data directory if directory is missing.", async () => {
  (loadJsonFile as jest.Mock).mockResolvedValueOnce({
    content: {
      dataDirectory: "foo",
      windowHeight: 800,
      windowWidth: 600,
    },
    update: jest.fn(),
  });

  const mkdir = jest.fn();
  (fsp.mkdir as jest.Mock).mockImplementation(mkdir);
  (fs.existsSync as jest.Mock).mockReturnValue(false);

  await getConfig();
  expect(mkdir).toHaveBeenCalledWith("foo");
});

test("getConfigPath", () => {
  jest.spyOn(process, "cwd").mockReturnValueOnce("foo");
  jest.spyOn(env, "isDevelopment").mockReturnValueOnce(true);
  expect(getConfigPath()).toBe("foo/config.json");

  jest.spyOn(env, "isDevelopment").mockReturnValueOnce(false);
  jest.spyOn(env, "isTest").mockReturnValueOnce(true);
  expect(getConfigPath()).toBe("");

  jest.spyOn(env, "isDevelopment").mockReturnValueOnce(false);
  jest.spyOn(env, "isTest").mockReturnValueOnce(false);

  (app.getPath as jest.Mock).mockReturnValueOnce("config-dir");
  expect(getConfigPath()).toBe("config-dir/config.json");
});
