import { parseJSON } from "date-fns";
import { z } from "zod";
import { DATE_OR_STRING_SCHEMA } from "../../../shared/domain";
import {
  DEFAULT_NOTE_SORTING_ALGORITHM,
  NoteSort,
} from "../../../shared/domain/note";
import {
  AppState,
  DEFAULT_SIDEBAR_WIDTH,
  Section,
} from "../../../shared/ui/app";
import { JsonMigration } from "../../json";

export const appStateSchemaV1 = z.object({
  version: z.literal(1).optional().default(1),
  sidebar: z.object({
    width: z
      .string()
      .regex(/^\d+px$/)
      .default(DEFAULT_SIDEBAR_WIDTH),
    scroll: z.number().default(0),
    hidden: z.boolean().optional(),
    selected: z.array(z.string()).optional(),
    expanded: z.array(z.string()).optional(),
    sort: z.nativeEnum(NoteSort).default(DEFAULT_NOTE_SORTING_ALGORITHM),
  }),
  editor: z.object({
    isEditing: z.boolean().default(false),
    scroll: z.number().default(0),
    tabs: z.array(
      z.object({
        noteId: z.string(),
        // Intentionally omitted noteContent
        lastActive: DATE_OR_STRING_SCHEMA.optional(),
      })
    ),
    tabsScroll: z.number().default(0),
    activeTabNoteId: z.string().optional(),
  }),
  focused: z.array(z.nativeEnum(Section)).default([]),
});

type AppStateV1 = z.infer<typeof appStateSchemaV1>;

export class AppStateInitialDefinition extends JsonMigration<
  AppStateV1,
  AppState
> {
  version = 1;

  async validateInput(input: unknown): Promise<AppStateV1> {
    return await appStateSchemaV1.parseAsync(input);
  }

  protected async migrate(input: AppStateV1): Promise<AppState> {
    return input;
  }
}
