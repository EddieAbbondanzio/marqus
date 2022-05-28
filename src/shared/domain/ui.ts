import { Point } from "electron";
import { keyBy, isEmpty } from "lodash";
import { PromisedInput } from "../promisedInput";
import { Note, NoteSort } from "./note";

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

export type Menu =
  | Seperator
  | SubMenu
  | RoleMenu
  | EventMenu<UIEventType>
  | RadioMenu<UIEventType>;

export interface Seperator extends BaseMenu {
  type: "separator";
}

export interface SubMenu extends BaseMenu {
  label: string;
  type: "submenu";
  children: Menu[];
}

export interface RoleMenu extends BaseMenu {
  label: string;
  type: "normal";
  shortcut?: string;
  disabled?: boolean;
  role: Electron.MenuItem["role"];
}

export interface EventMenu<Ev extends UIEventType = UIEventType>
  extends BaseMenu {
  label: string;
  type: "normal";
  shortcut?: string;
  disabled?: boolean;
  event: Ev;
  eventInput?: UIEventInput<Ev>;
}

export interface RadioMenu<Ev extends UIEventType = UIEventType>
  extends BaseMenu {
  label: string;
  type: "radio";
  shortcut?: string;
  checked?: boolean;
  disabled?: boolean;
  event: Ev;
  eventInput?: UIEventInput<Ev>;
}

export interface BaseMenu {
  type: Electron.MenuItem["type"];
  hidden?: boolean;
}

export function isRoleMenu(m: Menu): m is RoleMenu {
  return m.type === "normal" && "role" in m;
}

/*
 * Events are defined in shared so we can keep shortcuts and application menus
 * type safe.
 */
export interface UIEvents {
  // Global
  "app.quit": void;
  "app.openDataDirectory": void;
  "app.selectDataDirectory": void;
  "app.openDevTools": void;
  "app.reload": void;
  "app.toggleFullScreen": void;
  "app.inspectElement": Point;
  "app.toggleSidebar": void;

  // Sidebar
  "sidebar.updateScroll": number;
  "sidebar.scrollDown": void;
  "sidebar.scrollUp": void;
  "sidebar.resizeWidth": string;
  "sidebar.toggleFilter": void;
  "sidebar.createNote": string | null;
  "sidebar.renameNote": string;
  "sidebar.dragNote": { note: string; newParent?: string };
  "sidebar.deleteNote": string;
  "sidebar.moveNoteToTrash": string;
  "sidebar.setSelection": string[];
  "sidebar.clearSelection": void;
  "sidebar.collapseAll": void;
  "sidebar.expandAll": void;
  "sidebar.setNoteSort": { sort: NoteSort; note?: string };

  "sidebar.deleteSelectedNote": void;
  "sidebar.toggleItemExpanded": string;
  "sidebar.moveSelectionUp": void;
  "sidebar.moveSelectionDown": void;
  "sidebar.setSearchString": string;

  // Editor
  "editor.save": void;
  "editor.toggleView": void;
  "editor.setContent": string;
  "editor.updateScroll": number;
  "editor.loadNote": string;
  "editor.loadSelectedNote": void;

  // Focus Tracker
  "focus.push": Section | Section[];
  "focus.pop": void;

  // Context Menu
  "contextMenu.blur": void;
  "contextMenu.run": void;
  "contextMenu.moveSelectionUp": void;
  "contextMenu.moveSelectionDown": void;
}
export type UIEventType = keyof UIEvents;
export type UIEventInput<Ev extends UIEventType> = UIEvents[Ev];

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
