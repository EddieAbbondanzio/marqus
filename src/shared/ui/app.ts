import { keyBy, isEmpty } from "lodash";
import { PromisedInput } from "../promisedInput";
import { Note, NoteSort } from "../domain/note";
import * as monaco from "monaco-editor";

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
  scroll: number;
  tabs: EditorTab[];
  tabsScroll: number;
  activeTabNoteId?: string;
}

export interface EditorTab {
  noteId: string;
  noteContent?: string;
  lastActive?: Date;
}

// If a note was deleted but was referenced elsewhere in the ui state we need to
// clear out all references to it otherwise things will bork.
export function filterOutStaleNoteIds(ui: UI, notes: Note[]): UI {
  const currentNoteIds = keyBy(notes, (n) => n.id);

  // Remove any expanded sidebar items that were deleted.
  if (!isEmpty(ui.sidebar.expanded)) {
    ui.sidebar.expanded = ui.sidebar.expanded?.filter(
      (e) => currentNoteIds[e] != null
    );
  }

  // Remove any sidebar items that were selected.
  if (!isEmpty(ui.sidebar.selected)) {
    ui.sidebar.selected = ui.sidebar.selected?.filter(
      (s) => currentNoteIds[s] != null
    );
  }

  if (ui.editor.tabs != null) {
    ui.editor.tabs = ui.editor.tabs.filter(
      (t) => currentNoteIds[t.noteId] != null
    );
  }

  return ui;
}
