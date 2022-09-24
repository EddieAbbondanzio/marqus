import { z } from "zod";
import { Config } from "../shared/domain/config";
import { Shortcut } from "../shared/domain/shortcut";
import { DEFAULT_SHORTCUTS } from "../shared/io/defaultShortcuts";
import { parseKeyCodes } from "../shared/io/keyCode";
import { IpcMainTS } from "../shared/ipc";
import { Section } from "../shared/ui/app";
import { UIEventInput, UIEventType } from "../shared/ui/events";
import { JsonFile, loadJsonFile } from "./json";
import p from "path";
import { SHORTCUT_FILE_MIGRATIONS } from "./schemas/shortcuts";
import { OVERRIDE_SCHEMA } from "./schemas/shortcuts/1_initialDefinition";

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
  shortcuts: z.array(OVERRIDE_SCHEMA).optional(),
});

export interface ShortcutOverride {
  name: string;
  event?: UIEventType;
  eventInput?: UIEventInput<UIEventType>;
  keys?: string;
  when?: Section;
  repeat?: boolean;
  disabled?: boolean;
}

export function shortcutIpcs(ipc: IpcMainTS, config: JsonFile<Config>): void {
  const shortcuts: Shortcut[] = DEFAULT_SHORTCUTS;

  ipc.on("init", async () => {
    const shortcutFile = await loadJsonFile<Shortcuts>(
      p.join(config.content.dataDirectory!, SHORTCUT_FILE_PATH),
      SHORTCUT_FILE_SCHEMA,
      SHORTCUT_FILE_MIGRATIONS
    );

    const overrides = shortcutFile.content.shortcuts ?? [];

    for (const override of overrides) {
      const existing = shortcuts.find((s) => s.name === override.name);

      // Add new shortcut
      if (existing == null) {
        if (override.keys == null) {
          throw new Error(
            `Cannot add new shortcut ${override.name} without any keys.`
          );
        }

        const shortcut = {
          name: override.name,
          event: override.event as UIEventType,
          eventInput: override.eventInput,
          keys: parseKeyCodes(override.keys),
          when: override.when,
          repeat: override.repeat,
        };
        shortcuts.push(shortcut);
      }
      // Update existing
      else {
        if (override.disabled != null) {
          existing.disabled = override.disabled;
        }
        if (override.event != null) {
          existing.event = override.event;
        }
        if (override.eventInput != null) {
          existing.eventInput = override.eventInput;
        }
        if (override.keys != null) {
          existing.keys = parseKeyCodes(override.keys);
        }
        if (override.repeat != null) {
          existing.repeat = override.repeat;
        }
        if (override.when != null) {
          existing.when = override.when;
        }
      }
    }
  });

  ipc.handle("shortcuts.getAll", async () => {
    return shortcuts;
  });
}
