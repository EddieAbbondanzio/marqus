import * as fs from "fs";
import * as fsp from "fs/promises";
import * as p from "path";
import { subDays, subMonths, subWeeks } from "date-fns";
import { getLogFileName, getLogger } from "../../src/main/log";
import { createJsonFile } from "../__factories__/json";
import { Config } from "../../src/shared/domain/config";

jest.mock("fs/promises");
jest.mock("fs");

test("getLogger cleans up log directory", async () => {
  const monthOldLog = getLogFileName(subMonths(new Date(), 1));
  const threeWeekOldLog = getLogFileName(subWeeks(new Date(), 3));
  const twoDayOldLog = getLogFileName(subDays(new Date(), 2));
  const yesterdayLog = getLogFileName(subDays(new Date(), 1));
  const randomFile = "foo.txt";

  (fsp.readdir as jest.Mock).mockResolvedValueOnce([
    { name: monthOldLog } as fs.Dirent,
    { name: threeWeekOldLog } as fs.Dirent,
    { name: twoDayOldLog } as fs.Dirent,
    { name: yesterdayLog } as fs.Dirent,
    { name: randomFile } as fs.Dirent,
  ]);
  (fsp.stat as jest.Mock).mockResolvedValueOnce({
    birthtime: subMonths(new Date(), 1),
  });
  (fsp.stat as jest.Mock).mockResolvedValueOnce({
    birthtime: subWeeks(new Date(), 3),
  });
  (fsp.stat as jest.Mock).mockResolvedValueOnce({
    birthtime: subDays(new Date(), 2),
  });
  (fsp.stat as jest.Mock).mockResolvedValueOnce({
    birthtime: subDays(new Date(), 1),
  });

  const configFile = createJsonFile<Config>({
    logDirectory: "logs",
  } as Config);
  await getLogger(configFile, {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as Console);

  const { logDirectory } = configFile.content;

  expect(fsp.unlink).toHaveBeenNthCalledWith(
    1,
    p.join(logDirectory, monthOldLog)
  );
  expect(fsp.unlink).toHaveBeenNthCalledWith(
    2,
    p.join(logDirectory, threeWeekOldLog)
  );

  // These files shouldn't be deleted.
  expect(fsp.unlink).not.toHaveBeenCalledWith(
    p.join(logDirectory, twoDayOldLog)
  );
  expect(fsp.unlink).not.toHaveBeenCalledWith(
    p.join(logDirectory, yesterdayLog)
  );
  expect(fsp.unlink).not.toHaveBeenCalledWith(p.join(logDirectory, randomFile));
});

test("getLogger logs to file", async () => {
  const write = jest.fn();
  (fs.createWriteStream as jest.Mock).mockReturnValue({
    write,
  });
  (fsp.readdir as jest.Mock).mockResolvedValueOnce([]);

  const configFile = createJsonFile<Config>({
    logDirectory: "logs",
  } as Config);
  const log = await getLogger(configFile, {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as Console);

  log.info("foo");
  expect(write).toHaveBeenNthCalledWith(
    1,
    expect.stringMatching(/.* \(info\): foo/)
  );

  log.debug("code reached here!");
  expect(write).toHaveBeenNthCalledWith(
    2,
    expect.stringMatching(/.* \(debug\): code reached here!/)
  );

  log.warn("was missing file");
  expect(write).toHaveBeenNthCalledWith(
    3,
    expect.stringMatching(/.* \(warn\): was missing file/)
  );

  log.error("something went wrong!");
  expect(write).toHaveBeenNthCalledWith(
    4,
    expect.stringMatching(/.* \(ERROR\): something went wrong!/)
  );
});

test("getLogger close deletes empty log files", async () => {
  (fs.createWriteStream as jest.Mock).mockReturnValue({
    write: jest.fn(),
    close: jest.fn(),
  });
  (fsp.readdir as jest.Mock).mockResolvedValueOnce([]);

  const configFile = createJsonFile<Config>({
    logDirectory: "logs",
  } as Config);
  const log = await getLogger(configFile, {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as Console);

  (fs.statSync as jest.Mock).mockReturnValueOnce({
    size: 10,
  });
  log.close();
  expect(fs.unlinkSync).not.toBeCalledWith(log.filePath);

  (fs.statSync as jest.Mock).mockReturnValueOnce({
    size: 0,
  });
  log.close();
  expect(fs.unlinkSync).toBeCalledWith(log.filePath);
});
