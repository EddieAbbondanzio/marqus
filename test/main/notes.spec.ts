import { noteIpcs, NOTES_DIRECTORY } from "../../src/main/notes";
import { createConfig } from "../__factories__/config";
import { createIpcMainTS } from "../__factories__/ipc";
import { createJsonFile } from "../__factories__/json";
import { createLogger } from "../__factories__/logger";
import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";

jest.mock("fs");
jest.mock("fs/promises");

test("init note directory is created if missing in file system.", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig({ dataDirectory: "foo" }));

  (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

  noteIpcs(ipc, config, createLogger());
  await ipc.trigger("init");

  const noteDirPath = path.join("foo", NOTES_DIRECTORY);
  expect(fsp.mkdir).toHaveBeenCalledWith(noteDirPath);
});
