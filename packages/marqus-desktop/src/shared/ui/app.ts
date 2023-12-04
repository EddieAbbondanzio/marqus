import { keyBy, isEmpty, cloneDeep, orderBy } from "lodash";
import { PromisedInput } from "../promisedInput";
import { flatten, Note, NoteSort } from "../domain/note";
import * as monaco from "monaco-editor";
import { MatchData } from "fast-fuzzy";
import { ITextModelWithUndoRedoControl } from "../../renderer/utils/monaco";

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
  searchResults?: MatchData<Note>[];
  searchSelected?: string;
  searchScroll?: number;
  hidden?: boolean;
  width: string;
  scroll: number;
  input?: PromisedInput;
  selected?: string[];
  expanded?: string[];
  sort: NoteSort;
  scrollToNoteId?: string;
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
  isNewNote?: boolean;
  isPinned?: boolean;
  isPreview?: boolean;
}

export interface Cache {
  modelViewStates: Record<string, ModelViewState | undefined>;
  closedTabs: ClosedEditorTab[];
}

export type ModelViewState = {
  model?: ITextModelWithUndoRedoControl;
  viewState?: monaco.editor.ICodeEditorViewState;
};

export type ClosedEditorTab = {
  noteId: string;
  previousIndex: number;
  isPreview?: boolean;
};

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

  if (clonedUI.editor.activeTabNoteId == null) {
    const [tabsByLastActive] = orderBy(
      clonedUI.editor.tabs,
      ["lastActive"],
      ["desc"],
    );
    clonedUI.editor.activeTabNoteId = tabsByLastActive?.note.id;
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
  viewState?: monaco.editor.ICodeEditorViewState;
  isPinned?: boolean;
  isPreview?: boolean;
}

export function serializeAppState(
  appState: AppState,
  cache?: Cache,
): SerializedAppState {
  const { editor, ...cloned } = cloneDeep(appState);

  // We need to delete some values before sending them over to the main
  // thread otherwise electron will throw an error.
  if (cloned.sidebar != null) {
    delete cloned.sidebar.input;
    delete cloned.sidebar.searchResults;
    delete cloned.sidebar.searchSelected;
    delete cloned.sidebar.searchScroll;
  }

  return {
    ...cloned,
    editor: {
      ...editor,
      tabs: editor.tabs.map(t => ({
        noteId: t.note.id,
        lastActive: t.lastActive,
        viewState: cache?.modelViewStates[t.note.id]?.viewState,
        isPinned: t.isPinned,
        isPreview: t.isPreview,
      })),
    },
  };
}
