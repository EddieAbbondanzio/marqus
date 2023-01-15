import { keyBy, isEmpty, cloneDeep } from "lodash";
import { PromisedInput } from "../promisedInput";
import { flatten, Note, NoteSort } from "../domain/note";

export const DEFAULT_SIDEBAR_WIDTH = "250px";

export interface AppState {
  version: number;
  sidebar: Sidebar;
  editor: Editor;
  focused: Section[];
}

export enum Section {
  // Nested sections must include parent section name to trigger parent shortcuts
  Sidebar = "sidebar",
  SidebarInput = "sidebarInput",
  SidebarSearch = "sidebarSearch",
  Editor = "editor",
  EditorToolbar = "editorToolbar",
}

export interface Sidebar {
  searchString?: string;
  searchResults?: string[];
  searchSelected?: string;
  hidden?: boolean;
  width: string;
  scroll: number;
  input?: PromisedInput;
  selected?: string[];
  expanded?: string[];
  sort: NoteSort;
}

export interface Editor {
  isEditing: boolean;
  scroll: number;
  tabs: EditorTab[];
  tabsScroll: number;
  activeTabNoteId?: string;
}

export interface EditorTab {
  note: Note;
  lastActive?: Date;
}

// If a note was deleted but was referenced elsewhere in the ui state we need to
// clear out all references to it otherwise things will bork.
export function filterOutStaleNoteIds(
  ui: AppState,
  notes: Note[],
  flattenNotes = true,
): AppState {
  const clonedUI = cloneDeep(ui);
  const currentNoteIds = keyBy(
    flattenNotes ? flatten(notes) : notes,
    n => n.id,
  );

  // Remove any expanded sidebar items that were deleted.
  if (!isEmpty(clonedUI.sidebar.expanded)) {
    clonedUI.sidebar.expanded = clonedUI.sidebar.expanded?.filter(
      e => currentNoteIds[e] != null,
    );
  }

  // Remove any sidebar items that were selected.
  if (!isEmpty(clonedUI.sidebar.selected)) {
    clonedUI.sidebar.selected = clonedUI.sidebar.selected?.filter(
      s => currentNoteIds[s] != null,
    );
  }

  if (clonedUI.editor.tabs != null) {
    clonedUI.editor.tabs = clonedUI.editor.tabs.filter(
      t => currentNoteIds[t.note.id] != null,
    );
  }

  if (
    clonedUI.editor.activeTabNoteId != null &&
    currentNoteIds[clonedUI.editor.activeTabNoteId] == null
  ) {
    clonedUI.editor.activeTabNoteId = undefined;
  }

  return clonedUI;
}

export type SerializedAppState = Pick<AppState, "version" | "focused"> & {
  sidebar: SerializedSidebar;
  editor: SerializedEditor;
};

export type SerializedSidebar = Omit<Sidebar, "input">;

export type SerializedEditor = Omit<Editor, "tabs"> & {
  tabs: SerializedEditorTab[];
};

export interface SerializedEditorTab {
  noteId: string;
  lastActive?: Date;
}

export function serializeAppState(appState: AppState): SerializedAppState {
  const { editor, ...cloned } = cloneDeep(appState);

  // We need to delete some values before sending them over to the main
  // thread otherwise electron will throw an error.
  if (cloned.sidebar != null) {
    delete cloned.sidebar.input;
  }

  return {
    ...cloned,
    editor: {
      ...editor,
      tabs: editor.tabs.map(t => ({
        noteId: t.note.id,
        lastActive: t.lastActive,
      })),
    },
  };
}