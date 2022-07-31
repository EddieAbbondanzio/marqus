import { BrowserWindow, dialog, shell } from "electron";
import { IpcMainTS } from "../../shared/ipc";
import { ConfigRepo } from "./configRepo";
import { Config } from "../../shared/domain/config";

export function configIpcs(
  ipc: IpcMainTS,
  config: Config,
  repo: ConfigRepo
): void {
  ipc.handle(
    "config.hasDataDirectory",
    async () => config.dataDirectory != null
  );

  ipc.handle("config.openDataDirectory", async () => {
    if (config.dataDirectory == null) {
      return;
    }

    shell.openPath(config.dataDirectory);
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

    config.dataDirectory = filePaths[0];

    await repo.update(config);
    focusedWindow.reload();
  });
}
