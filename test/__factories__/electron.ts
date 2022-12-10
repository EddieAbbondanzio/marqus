import { BrowserWindow } from "electron";

export function createBrowserWindow(
  partial?: Partial<BrowserWindow>,
): BrowserWindow {
  // Gonna have to add mocks as we use them...
  const bw: BrowserWindow = {} as any;
  Object.assign(bw, partial);

  bw.setMenu ??= jest.fn();
  bw.on ??= jest.fn();
  bw.setMenu = jest.fn();

  if (bw.webContents == null) {
    (bw as any).webContents = {
      setWindowOpenHandler: jest.fn(),
    } as any;
  }

  return bw;
}
