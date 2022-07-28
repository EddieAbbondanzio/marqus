import { createConfig } from "../../__factories__/config";
import { useAppIpcs } from "../../../src/main/app/appIpcs";
import { createIpcMainTS } from "../../__factories__/ipc";

const inspectElement = jest.fn();
jest.mock("electron", () => {
  return {
    BrowserWindow: {
      getFocusedWindow: () => ({
        webContents: {
          inspectElement,
        },
      }),
    },
  };
});

test("app.inspectElement rounds floats", async () => {
  const ipc = createIpcMainTS();
  const config = createConfig();
  useAppIpcs(ipc, config);

  await ipc.invoke("app.inspectElement", { x: 1.23, y: 2.67 });
  expect(inspectElement).toBeCalledWith(1, 3);
});

test("app.inspectElement throws", async () => {
  const ipc = createIpcMainTS();
  const config = createConfig();
  useAppIpcs(ipc, config);

  expect(async () => {
    await ipc.invoke("app.inspectElement", undefined!);
  }).rejects.toThrow();
});
