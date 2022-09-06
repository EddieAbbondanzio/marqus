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
};
