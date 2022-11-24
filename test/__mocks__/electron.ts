// Electron won't let us run our tests. It'll throw an error saying "Electron was
// not properly installed. Please re-install node modules" or something like that.

import { createIpcMainTS } from "../__factories__/ipc";

export default {};

export const ipcMain = createIpcMainTS();
export const app = {
  on: jest.fn(),
  quit: jest.fn(),
  getPath: jest.fn(),
  isReady: jest.fn(),
};

export const BrowserWindow = {
  getFocusedWindow: jest.fn(),
  getAllWindows: jest.fn(),
};

export const shell = {
  trashItem: jest.fn(),
  openPath: jest.fn(),
  openExternal: jest.fn(),
};

export const dialog = {
  showOpenDialog: jest.fn(),
  showMessageBox: jest.fn(),
};

export const Menu = {
  buildFromTemplate: jest.fn(),
};

export const protocol = {
  registerFileProtocol: jest.fn(),
};
