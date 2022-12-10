import { DEFAULT_SHORTCUTS } from "../../shared/io/defaultShortcuts";
import { parseKeyCodes } from "../../shared/io/keyCode";
import { BrowserWindowEvent, IpcChannel } from "../../shared/ipc";
import { Section } from "../../shared/ui/app";
import { UIEventInput, UIEventType } from "../../shared/ui/events";
import { loadJsonFile } from "./../json";
import p from "path";
import { SHORTCUTS_SCHEMAS } from "./../schemas/shortcuts";
import { AppContext } from "..";

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

export interface ShortcutOverride {
  name: string;
  event?: UIEventType;
  eventInput?: UIEventInput<UIEventType>;
  keys?: string;
  when?: Section;
  repeat?: boolean;
  disabled?: boolean;
}

export function shortcutIpcs(ctx: AppContext): void {
  const { browserWindow, ipc, config } = ctx;

  browserWindow.on("blur", () => {
    browserWindow.webContents.send(IpcChannel.BrowserWindow, {
      event: BrowserWindowEvent.Blur,
    });
  });

  ipc.handle("shortcuts.getAll", async () => {
    const shortcuts = [...DEFAULT_SHORTCUTS];

    const shortcutFile = await loadJsonFile<Shortcuts>(
      p.join(config.content.dataDirectory!, SHORTCUT_FILE_PATH),
      SHORTCUTS_SCHEMAS,
      { defaultContent: { version: 1, shortcuts: [] } },
    );

    const overrides = shortcutFile.content.shortcuts ?? [];

    for (const override of overrides) {
      const existing = shortcuts.find(s => s.name === override.name);

      // Add new shortcut
      if (existing == null) {
        if (override.keys == null) {
          throw new Error(
            `Cannot add new shortcut ${override.name} without any keys.`,
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

    return shortcuts;
  });
}
