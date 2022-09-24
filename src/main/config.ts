import { BrowserWindow, dialog, shell } from "electron";
import { IpcMainTS } from "../shared/ipc";
import { Config } from "../shared/domain/config";
import { JsonFile } from "./json";

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
