import { z } from "zod";
import { Config } from "../shared/domain/config";
import { Shortcut, shortcutSchema } from "../shared/domain/shortcut";
import { DEFAULT_SHORTCUTS } from "../shared/io/defaultShortcuts";
import { parseKeyCodes } from "../shared/io/keyCode";
import { IpcMainTS } from "../shared/ipc";
import { Section } from "../shared/ui/app";
import { UIEventType } from "../shared/ui/events";
import { JsonFile, loadJsonFile } from "./json";
import p from "path";
import { SHORTCUT_FILE_MIGRATIONS } from "./migrations/shortcuts";

export interface Shortcuts {
  version: number;
  shortcuts: ShortcutOverride[];
}

/*
 * Custom shortcut uses cases:
 * - Disable an existing shortcut
 * - Modify the keys of an existing shortcut
 * - Modify the "when" of an existing shortcut
 * - Create a new custom shortcut
 */

export const SHORTCUT_FILE_PATH = "shortcuts.json";

export const SHORTCUT_FILE_SCHEMA = z.object({
  version: z.literal(1).optional().default(1),
  shortcuts: z.array(shortcutSchema).optional(),
});

// TODO: Improve typing here

export interface ShortcutOverride {
  name?: string;
  event: UIEventType;
  keys?: string;
  disabled?: boolean;
  when?: string;
  repeat?: boolean;
}

export function shortcutIpcs(ipc: IpcMainTS, config: JsonFile<Config>): void {
  let shortcuts: Shortcut[] = [];

  ipc.on("init", async () => {
    const shortcutFile = await loadJsonFile<Shortcuts>(
      p.join(config.content.dataDirectory!, SHORTCUT_FILE_PATH),
      SHORTCUT_FILE_SCHEMA,
      SHORTCUT_FILE_MIGRATIONS
    );

    const raw = shortcutFile.content.shortcuts ?? [];

    // Is there any redundant keys?
    const duplicates = raw.filter(
      (item, index) => raw.findIndex((i) => i.keys === item.keys) != index
    );

    if (duplicates.length > 0) {
      console.error(
        "Error: Complete list of duplicate shortcuts: ",
        duplicates
      );
      throw Error(`Duplicate shortcuts for keys ${duplicates[0].keys}`);
    }

    shortcuts = [];
    for (const defaultShortcut of DEFAULT_SHORTCUTS) {
      const userOverride = raw.find((s) => s.name === defaultShortcut.name);

      let shortcut: Shortcut;

      if (userOverride == null) {
        shortcut = Object.assign({}, defaultShortcut);
      } else {
        // Validate it has keys if it's new.
        if (userOverride.keys == null) {
          throw Error(
            `User defined shortcut for ${userOverride.event} does not have any keys specified`
          );
        }

        shortcut = Object.assign(
          {},
          {
            ...userOverride,
            name: userOverride.name!,
            type: "shortcut",
            keys: parseKeyCodes(userOverride.keys),
            when: userOverride.when as Section,
          }
        );
      }

      shortcuts.push(shortcut);
    }
  });

  ipc.handle("shortcuts.getAll", async () => shortcuts);
}
