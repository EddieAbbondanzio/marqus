import { initIpc } from "../../../__factories__/ipc";
import {
  shortcutsIpcPlugin,
  SHORTCUT_FILE_PATH,
} from "../../../../src/main/ipc/plugins/shortcuts";
import { Section } from "../../../../src/shared/ui/app";
import { parseKeyCodes } from "../../../../src/shared/io/keyCode";
import mockFS from "mock-fs";
import { SHORTCUTS_SCHEMAS } from "../../../../src/main/schemas/shortcuts";
import { getLatestSchemaVersion } from "../../../../src/main/schemas/utils";
import { createBrowserWindow } from "../../../__factories__/electron";
import { WebContents } from "electron";
import { BrowserWindowEvent, IpcChannel } from "../../../../src/shared/ipc";

afterEach(() => {
  mockFS.restore();
});

test("shortcutIpcs triggers blur event", async () => {
  const on = jest.fn();
  const send = jest.fn();
  const browserWindow = createBrowserWindow({
    on,
    webContents: { send } as unknown as WebContents,
  });

  await initIpc({ browserWindow }, shortcutsIpcPlugin);

  expect(on).toHaveBeenCalledTimes(1);
  const [ev, cb] = on.mock.calls[0];
  expect(ev).toBe("blur");

  cb();
  expect(send).toHaveBeenCalledWith(IpcChannel.BrowserWindow, {
    event: BrowserWindowEvent.Blur,
  });
});

test("shortcuts.getAll", async () => {
  const { ipc } = await initIpc({}, shortcutsIpcPlugin);

  mockFS({
    [SHORTCUT_FILE_PATH]: JSON.stringify({
      version: getLatestSchemaVersion(SHORTCUTS_SCHEMAS),
      shortcuts: [
        // Disable existing shortcut
        {
          name: "sidebar.focus",
          disabled: true,
        },
        // Change keys existing shortcut
        {
          name: "app.toggleSidebar",
          keys: "control+alt+s",
        },
        // Change when existing shortcut
        {
          name: "app.quit",
          when: Section.Sidebar,
        },
        // Change event input existing shortcut
        {
          name: "notes.create",
          eventInput: "foo",
        },
        // Change repeat existing shortcut
        {
          name: "app.reload",
          repeat: true,
        },
        // Add a new shortcut
        {
          name: "openNoteDirectory2",
          event: "app.openNoteDirectory",
          keys: "control+o+d+f",
          when: Section.Editor,
          repeat: false,
        },
      ],
    }),
  });

  const shortcuts = await ipc.invoke("shortcuts.getAll");

  const sidebarFocus = shortcuts.find(s => s.name === "sidebar.focus");
  expect(sidebarFocus).toEqual(
    expect.objectContaining({
      disabled: true,
      event: "focus.push",
      name: "sidebar.focus",
    }),
  );

  const appToggleSidebar = shortcuts.find(s => s.name === "app.toggleSidebar");
  expect(appToggleSidebar).toEqual(
    expect.objectContaining({
      name: "app.toggleSidebar",
      event: "app.toggleSidebar",
      keys: parseKeyCodes("control+alt+s"),
    }),
  );

  const appQuit = shortcuts.find(s => s.name === "app.quit");
  expect(appQuit).toEqual(
    expect.objectContaining({
      name: "app.quit",
      when: Section.Sidebar,
      event: "app.quit",
    }),
  );

  const createNote = shortcuts.find(s => s.name === "notes.create");
  expect(createNote).toEqual(
    expect.objectContaining({
      name: "notes.create",
      event: "sidebar.createNote",
      eventInput: "foo",
    }),
  );

  const appReload = shortcuts.find(s => s.name === "app.reload");
  expect(appReload).toEqual(
    expect.objectContaining({
      name: "app.reload",
      event: "app.reload",
      repeat: true,
    }),
  );

  const openNoteDirectory = shortcuts.find(
    s => s.name === "openNoteDirectory2",
  );
  expect(openNoteDirectory).toEqual(
    expect.objectContaining({
      name: "openNoteDirectory2",
      event: "app.openNoteDirectory",
      when: Section.Editor,
      repeat: false,
    }),
  );
});
