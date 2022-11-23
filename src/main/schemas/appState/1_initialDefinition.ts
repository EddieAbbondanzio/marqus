import { z } from "zod";
import { DATE_OR_STRING_SCHEMA, PX_REGEX } from "../../../shared/domain";
import { NoteSort } from "../../../shared/domain/note";
import { Section } from "../../../shared/ui/app";

export interface AppStateV1 {
  version: number;
  sidebar: Sidebar;
  editor: Editor;
  focused: Section[];
}

interface Sidebar {
  searchString?: string;
  hidden?: boolean;
  width: string;
  scroll: number;
  selected?: string[];
  expanded?: string[];
  sort: NoteSort;
}

interface Editor {
  isEditing: boolean;
  scroll: number;
  tabs: EditorTab[];
  tabsScroll: number;
  activeTabNoteId?: string;
}

interface EditorTab {
  noteId: string;
  noteContent?: string;
  lastActive?: Date | string;
}

export const appStateV1: z.Schema<AppStateV1> = z.object({
  version: z.literal(1),
  sidebar: z.object({
    width: z.string().regex(PX_REGEX),
    scroll: z.number(),
    hidden: z.boolean().optional(),
    selected: z.array(z.string()).optional(),
    expanded: z.array(z.string()).optional(),
    sort: z.nativeEnum(NoteSort),
  }),
  editor: z.object({
    isEditing: z.boolean(),
    scroll: z.number(),
    tabs: z.array(
      z.object({
        noteId: z.string(),
        // Intentionally omitted noteContent
        lastActive: DATE_OR_STRING_SCHEMA.optional(),
      }),
    ),
    tabsScroll: z.number(),
    activeTabNoteId: z.string().optional(),
  }),
  focused: z.array(z.nativeEnum(Section)),
});
