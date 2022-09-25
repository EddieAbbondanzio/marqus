import {
  DEFAULT_DEV_DATA_DIRECTORY,
  DEFAULT_DEV_LOG_DIRECTORY,
  getConfig,
} from "../../src/main/config";
import fsp from "fs/promises";
import fs from "fs";
import * as env from "../../src/shared/env";
import { loadJsonFile } from "../../src/main/json";

jest.mock("fs/promises");
jest.mock("fs");
jest.mock("../../src/main/json");

test("getConfig defaults data / log directory in development", async () => {
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
