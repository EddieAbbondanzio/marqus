import * as json from "../../src/main/json";
import { DEFAULT_DEV_DATA_DIRECTORY, main } from "../../src/main/index";
import fsp from "fs/promises";
import fs from "fs";
import * as env from "../../src/shared/env";

jest.mock("fs/promises");
jest.mock("fs");

test("main defaults data directory in development", async () => {
  const update = jest.fn();

  jest.spyOn(json, "loadJsonFile").mockResolvedValueOnce({
    content: {
      dataDirectory: null,
      windowHeight: 800,
      windowWidth: 600,
    },
    update,
  });
  jest.spyOn(env, "isDevelopment").mockReturnValue(true);

  await main();
  expect(update).toHaveBeenCalledWith({
    dataDirectory: DEFAULT_DEV_DATA_DIRECTORY,
  });
});

test("main creates data directory if directory is missing.", async () => {
  jest.spyOn(json, "loadJsonFile").mockResolvedValueOnce({
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

  await main();
  expect(mkdir).toHaveBeenCalledWith("foo");
});
