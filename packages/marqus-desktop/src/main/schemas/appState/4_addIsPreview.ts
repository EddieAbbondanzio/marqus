import { z } from "zod";
import { ModelViewState, Section } from "../../../shared/ui/app";
import { DATE_OR_STRING_SCHEMA, PX_REGEX } from "../../../shared/domain";
import { NoteSort } from "../../../shared/domain/note";
import { AppStateV3 } from "./3_addIsPinned";

export interface AppStateV4 {
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
  viewState?: ModelViewState["viewState"];
  isPinned?: boolean;
  isPreview?: boolean;
}

export const appStateV4 = z.preprocess(
  obj => {
    const state = obj as AppStateV3 | AppStateV4;
    if (state.version === 3) {
      state.version = 4;
    }

    return state;
  },
  z.object({
    version: z.literal(4),
    sidebar: z.object({
      width: z.string().regex(PX_REGEX),
      scroll: z.number(),
      hidden: z.boolean().optional(),
      selected: z.array(z.string()).optional(),
      expanded: z.array(z.string()).optional(),
      sort: z.nativeEnum(NoteSort),
      searchString: z.string().optional(),
    }),
    editor: z.object({
      isEditing: z.boolean(),
      scroll: z.number(),
      tabs: z.array(
        z.object({
          noteId: z.string(),
          // Intentionally omitted noteContent
          lastActive: DATE_OR_STRING_SCHEMA.optional(),
          viewState: z.any().optional(),
          isPinned: z.boolean().optional(),
          isPreview: z.boolean().optional(),
        }),
      ),
      tabsScroll: z.number(),
      activeTabNoteId: z.string().optional(),
    }),
    focused: z.array(z.nativeEnum(Section)),
  }),
);
