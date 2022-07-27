import { z } from "zod";
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
  version: z.literal(1),
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
    isEditting: z.boolean().default(false),
    scroll: z.number().default(0),
    tabs: z.array(
      z.object({
        noteId: z.string(),
        // Intentionally omitted noteContent
        lastActive: z.date().optional(),
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

  async validate(input: unknown): Promise<AppStateV1> {
    return await appStateSchemaV1.parseAsync(input);
  }

  protected async do(input: AppStateV1): Promise<AppState> {
    // ui.sidebar.input = undefined;
    // ui.focused = [];

    // ui.editor ??= {};
    // ui.editor.tabs ??= [];
    // for (const tab of ui.editor.tabs) {
    //   tab.model = undefined;
    //   tab.viewState = undefined;
    //   tab.lastActive = parseJSON(tab.lastActive);
    // }

    // // Check if active tab is stale.
    // if (
    //   ui.editor.activeTabNoteId != null &&
    //   ui.editor.tabs.every(
    //     (t: EditorTab) => t.noteId != ui.editor.activeTabNoteId
    //   )
    // ) {
    //   ui.editor.activeTabNoteId = undefined;
    // }

    // Nothing to do here. We simply have this migration for a sanity check.
    return input;
  }
}
