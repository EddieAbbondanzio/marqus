import { BrowserWindow, dialog, shell } from "electron";
import { IpcMainTS } from "../shared/ipc";
import { DEFAULT_WINDOW_HEIGHT, DEFAULT_WINDOW_WIDTH } from ".";
import { Config } from "../shared/domain/config";
import { z } from "zod";
import { JsonFile } from "./json";

export const CONFIG_SCHEMA = z
  .object({
    version: z.literal(1).optional().default(1),
    windowHeight: z.number().min(1).optional().default(DEFAULT_WINDOW_HEIGHT),
    windowWidth: z.number().min(1).optional().default(DEFAULT_WINDOW_WIDTH),
    dataDirectory: z.string().optional(),
  })
  .default({
    version: 1,
  });
 
export function configIpcs(ipc: IpcMainTS, config: JsonFile<Config>): void {
  ipc.handle(
    "config.hasDataDirectory",
    async () => config.content.dataDirectory != null
  );

  ipc.handle("config.openDataDirectory", async () => {
    if (config.content.dataDirectory == null) {
      return;
    }

    shell.openPath(config.content.dataDirectory);
  });

  ipc.handle("config.selectDataDirectory", async () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow == null) {
      throw new Error();
    }

    const { filePaths } = await dialog.showOpenDialog(focusedWindow, {
      properties: ["openDirectory"],
    });
    if (filePaths.length == 0) {
      return;
    }

    await config.update({ dataDirectory: filePaths[0] });
    focusedWindow.reload();
  });
}
