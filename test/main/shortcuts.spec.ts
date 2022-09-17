import { createConfig } from "../__factories__/config";
import { createIpcMainTS } from "../__factories__/ipc";
import { createJsonFile } from "../__factories__/jsonFile";
import { shortcutIpcs, ShortcutOverride } from "../../src/main/shortcuts";

jest.mock("fs");
jest.mock("fs/promises");

test("shortcutIpcs init", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());

  shortcutIpcs(ipc, config);
  ipc.trigger("init");

  const overrides: ShortcutOverride[] = [
    // Disable existing shortcut
    {
      name: "sidebar.focus",
      event: "focus.push",
      disabled: true,
    },
    // Change keys/when of existing shortcut
    {
      name: "app.toggleSidebar",
      event: "app.toggleSidebar",
      keys: "ctrl+alt+s",
    },
    // Add a new shortcut
    {
      event: "app.openDataDirectory",
      keys: "ctrl+o+d+f",
    },
  ];
});
