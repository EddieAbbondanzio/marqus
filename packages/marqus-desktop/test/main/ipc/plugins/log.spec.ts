import { subDays, subMonths, subWeeks } from "date-fns";
import {
  getLogFileName,
  getLogger,
} from "../../../../src/main/ipc/plugins/log";
import { createJsonFile } from "../../../__factories__/json";
import { Config } from "../../../../src/shared/domain/config";
import mockFS from "mock-fs";
import fs from "fs";
import * as os from "os";

const FAKE_LOG_DIR = "logs";

afterEach(() => {
  mockFS.restore();
});

test("getLogger cleans up log directory", async () => {
  const monthOldLog = getLogFileName(subMonths(new Date(), 1));
  const threeWeekOldLog = getLogFileName(subWeeks(new Date(), 3));
  const twoDayOldLog = getLogFileName(subDays(new Date(), 2));
  const yesterdayLog = getLogFileName(subDays(new Date(), 1));
  const randomFile = "foo.txt";

  mockFS({
    [FAKE_LOG_DIR]: {
      [monthOldLog]: mockFS.file({ birthtime: subMonths(new Date(), 1) }),
      [threeWeekOldLog]: mockFS.file({ birthtime: subWeeks(new Date(), 3) }),
      [twoDayOldLog]: mockFS.file({ birthtime: subDays(new Date(), 2) }),
      [yesterdayLog]: mockFS.file({ birthtime: subDays(new Date(), 1) }),
      [randomFile]: mockFS.file({ birthtime: subMonths(new Date(), 1) }),
    },
  });

  const configFile = createJsonFile<Config>({
    logDirectory: FAKE_LOG_DIR,
  } as Config);
  const log = await getLogger(configFile, {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as Console);
  await log.close();
  const entries = await fs.promises.readdir(FAKE_LOG_DIR, {
    withFileTypes: true,
  });

  // Should not have been deleted.
  expect(entries).toContainEqual(
    expect.objectContaining({
      name: randomFile,
    }),
  );
  expect(entries).toContainEqual(
    expect.objectContaining({
      name: twoDayOldLog,
    }),
  );
  expect(entries).toContainEqual(
    expect.objectContaining({
      name: yesterdayLog,
    }),
  );

  // Should be deleted.
  expect(entries).not.toContainEqual(
    expect.objectContaining({
      name: monthOldLog,
    }),
  );
  expect(entries).not.toContainEqual(
    expect.objectContaining({
      name: threeWeekOldLog,
    }),
  );
});

test("getLogger logs to file", async () => {
  mockFS({
    [FAKE_LOG_DIR]: {},
  });

  const configFile = createJsonFile<Config>({
    logDirectory: FAKE_LOG_DIR,
  } as Config);
  const log = await getLogger(configFile, {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as Console);

  await log.info("foo");
  await log.debug("code reached here!");
  await log.warn("was missing file");
  await log.error("something went wrong!");

  const logFileContent = await fs.promises.readFile(log.filePath, {
    encoding: "utf-8",
  });
  const lines = logFileContent.split(os.EOL);

  expect(lines[0]).toMatch(/.* \(info\): foo/);
  expect(lines[1]).toMatch(/.* \(debug\): code reached here!/);
  expect(lines[2]).toMatch(/.* \(warn\): was missing file/);
  expect(lines[3]).toMatch(/.* \(ERROR\): something went wrong!/);
});

test("getLogger close deletes empty log files", async () => {
  mockFS({
    [FAKE_LOG_DIR]: {},
  });

  const configFile = createJsonFile<Config>({
    logDirectory: "logs",
  } as Config);
  const log = await getLogger(configFile, {} as unknown as Console);
  expect(fs.existsSync(log.filePath)).toBe(true);

  // Intentionally don't log anything so the file is empty.
  await log.close();

  expect(fs.existsSync(log.filePath)).toBe(false);
});
