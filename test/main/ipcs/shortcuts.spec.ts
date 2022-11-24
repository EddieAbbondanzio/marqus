import { createConfig } from "../../__factories__/config";
import { createIpcMainTS } from "../../__factories__/ipc";
import { createJsonFile } from "../../__factories__/json";
import {
  shortcutIpcs,
  SHORTCUT_FILE_PATH,
} from "../../../src/main/ipcs/shortcuts";
import { Section } from "../../../src/shared/ui/app";
import { parseKeyCodes } from "../../../src/shared/io/keyCode";
import { createLogger } from "../../__factories__/logger";
import mockFS from "mock-fs";
import { SHORTCUTS_SCHEMAS } from "../../../src/main/schemas/shortcuts";
import { getLatestSchemaVersion } from "../../../src/main/schemas/utils";

afterEach(() => {
  mockFS.restore();
});

test("shortcuts.getAll", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());

  mockFS({
    [config.content.dataDirectory]: {
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
            name: "openDataDirectory2",
            event: "app.openDataDirectory",
            keys: "control+o+d+f",
            when: Section.Editor,
            repeat: false,
          },
        ],
      }),
    },
  });

  shortcutIpcs(ipc, config, createLogger());
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

  const openDataDirectory = shortcuts.find(
    s => s.name === "openDataDirectory2",
  );
  expect(openDataDirectory).toEqual(
    expect.objectContaining({
      name: "openDataDirectory2",
      event: "app.openDataDirectory",
      when: Section.Editor,
      repeat: false,
    }),
  );
});
