import { keyBy, isEmpty } from "lodash";
import { PromisedInput } from "../../promisedInput";
import { Note, NoteSort } from "../note";

export interface UI {
  sidebar: Sidebar;
  editor: Editor;
  focused: Section[];
}

export enum Section {
  Sidebar = "sidebar",
  SidebarInput = "sidebarInput",
  SidebarSearch = "sidebarSearch",
  Editor = "editor",
}

export interface Sidebar {
  searchString?: string;
  hidden?: boolean;
  width: string;
  scroll: number;
  input?: PromisedInput;
  selected?: string[];
  expanded?: string[];
  sort: NoteSort;
}

export interface Editor {
  isEditting: boolean;
  content?: string;
  noteId?: string;
  scroll: number;
}

// If a note was deleted but was referenced elsewhere in the ui state we need to
// clear out all references to it otherwise things will bork.
export function filterOutStaleNoteIds(ui: UI, notes: Note[]): UI {
  const noteIds = keyBy(notes, (n) => n.id);

  // Remove any expanded sidebar items that were deleted.
  if (!isEmpty(ui.sidebar.expanded)) {
    ui.sidebar.expanded = ui.sidebar.expanded?.filter(
      (e) => noteIds[e] != null
    );
  }

  // Remove any sidebar items that were selected.
  if (!isEmpty(ui.sidebar.selected)) {
    ui.sidebar.selected = ui.sidebar.selected?.filter(
      (s) => noteIds[s] != null
    );
  }

  // Clear out the editor if the note was loaded.
  if (ui.editor.noteId != null && !noteIds[ui.editor.noteId]) {
    ui.editor = {
      isEditting: false,
      scroll: 0,
      content: undefined,
      noteId: undefined,
    };
  }

  return ui;
}
