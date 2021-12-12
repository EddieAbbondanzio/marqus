import { BrowserWindow, dialog } from "electron";
import { RpcHandler, RpcRegistry } from "../../shared/rpc";

const promptUser: RpcHandler<"app.promptUser"> = async (opts) => {
  const cancelCount = opts.buttons.filter((b) => b.role === "cancel").length;
  const defaultCount = opts.buttons.filter((b) => b.role === "default").length;

  if (cancelCount > 1) {
    throw Error(`${cancelCount} cancel buttons found.`);
  }

  if (defaultCount > 1) {
    throw Error(`${defaultCount} default buttons found.`);
  }

  const returnVal = await dialog.showMessageBox({
    title: opts.title,
    type: opts.type ?? "info",
    message: opts.text,
    buttons: opts.buttons.map((b) => b.text),
  });

  // Return back the button that was selected.
  return opts.buttons[returnVal.response];
};

const openDevTools: RpcHandler<"app.openDevTools"> = async () => {
  BrowserWindow.getFocusedWindow()?.webContents.openDevTools();
};

const reload: RpcHandler<"app.reload"> = async () => {
  BrowserWindow.getFocusedWindow()?.webContents.reload();
};

const toggleFullScreen: RpcHandler<"app.toggleFullScreen"> = async () => {
  const bw = BrowserWindow.getFocusedWindow();

  if (bw == null) {
    return;
  }

  bw.setFullScreen(!bw.isFullScreen());
};

const quit: RpcHandler<"app.quit"> = async () => {
  BrowserWindow.getAllWindows().forEach((w) => w.close());
};

const inspectElement: RpcHandler<"app.inspectElement"> = async (coord) => {
  BrowserWindow.getFocusedWindow()?.webContents.inspectElement(
    coord.x,
    coord.y
  );
};

export const appRpcs: RpcRegistry = {
  "app.promptUser": promptUser,
  "app.openDevTools": openDevTools,
  "app.reload": reload,
  "app.toggleFullScreen": toggleFullScreen,
  "app.quit": quit,
  "app.inspectElement": inspectElement,
};
