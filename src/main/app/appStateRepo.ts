import { parseJSON } from "date-fns";
import { z } from "zod";
import {
  NoteSort,
  DEFAULT_NOTE_SORTING_ALGORITHM,
} from "../../shared/domain/note";
import { AppState, DEFAULT_SIDEBAR_WIDTH, Section } from "../../shared/ui/app";
import { writeFile } from "../fileSystem";
import { loadAndMigrateJson, Versioned } from "../json";
import { APP_STATE_MIRGATIONS } from "./migrations";

export const APP_STATE_FILE = "ui.json";

const appStateSchema = z
  .object({
    version: z.literal(1).optional().default(1),
    sidebar: z
      .object({
        width: z
          .string()
          .regex(/^\d+px$/)
          .default(DEFAULT_SIDEBAR_WIDTH),
        scroll: z.number().default(0),
        hidden: z.boolean().optional(),
        selected: z.array(z.string()).optional(),
        expanded: z.array(z.string()).optional(),
        sort: z.nativeEnum(NoteSort).default(DEFAULT_NOTE_SORTING_ALGORITHM),
      })
      .default({}),
    editor: z
      .object({
        isEditting: z.boolean().default(false),
        scroll: z.number().default(0),
        tabs: z
          .array(
            z.object({
              noteId: z.string(),
              // Intentionally omitted noteContent
              lastActive: z.preprocess((arg) => {
                // If loaded from JSON dates will be a string
                if (typeof arg === "string") {
                  return parseJSON(arg);
                }
                // But if it was already in memory they'll be a date.
                else if (arg instanceof Date) {
                  return arg;
                }
              }, z.date().optional()),
            })
          )
          .default([]),
        tabsScroll: z.number().default(0),
        activeTabNoteId: z.string().optional(),
      })
      .default({}),
    focused: z.array(z.nativeEnum(Section)).default([]),
  })
  .default({
    version: 1,
  });

// Interface is needed to support testing.
export interface IAppStateRepo {
  get(): Promise<AppState>;
  update(appState: AppState): Promise<AppState>;
}

export class AppStateRepo implements IAppStateRepo {
  constructor(private path: string) {}

  async get(): Promise<AppState> {
    let appState = await loadAndMigrateJson<Versioned<AppState>>(
      this.path,
      APP_STATE_MIRGATIONS
    );

    // We always want to run this because it'll apply defaults for any missing
    // values, and in the event the json file has been modified to the point
    // where it's unusuable, it'll throw an error instead of proceeding.
    appState = await appStateSchema.parseAsync(appState);

    return appState;
  }

  async update(appState: AppState): Promise<AppState> {
    const validated = await appStateSchema.parseAsync(appState);

    await writeFile(this.path, validated, "json");
    return validated;
  }
}
