import { createConfig } from "../__factories__/config";
import { createIpcMainTS } from "../__factories__/ipc";
import { appIpcs } from "../../src/main/app";
import { createJsonFile } from "../__factories__/json";
import { BrowserWindow } from "../__mocks__/electron";
import { createLogger } from "../__factories__/logger";

test("app.inspectElement rounds floats", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  appIpcs(ipc, config, createLogger());

  const inspectElement = jest.fn();
  BrowserWindow.getFocusedWindow.mockImplementationOnce(() => ({
    webContents: {
      inspectElement,
    },
  }));

  await ipc.invoke("app.inspectElement", { x: 1.23, y: 2.67 });
  expect(inspectElement).toBeCalledWith(1, 3);
});
