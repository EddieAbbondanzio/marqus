import { IpcPlugin } from "../../shared/ipc";
import { BrowserWindow, dialog, shell } from "electron";
import { writeFile } from "../fileSystem";
import { getConfigPath } from "..";

export const configIpcs: IpcPlugin = (ipc, config) => {
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

    await writeFile(getConfigPath(), config, "json");
    focusedWindow.reload();
  });
};
