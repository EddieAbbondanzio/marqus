import { Point } from "electron";
import { keyBy, isEmpty } from "lodash";
import { PromisedInput } from "../promisedInput";
import { Note } from "./note";

export interface UI {
  sidebar: Sidebar;
  editor: Editor;
  focused: Section[];
}

export const ALL_SECTIONS = [
  "sidebar",
  "sidebarInput",
  "sidebarSearch",
  "editor",
] as const;
export type Section = typeof ALL_SECTIONS[number];

export interface Sidebar {
  searchString?: string;
  hidden?: boolean;
  width: string;
  scroll: number;
  input?: PromisedInput;
  selected?: string[];
  expanded?: string[];
}

export interface Editor {
  isEditting: boolean;
  content?: string;
  noteId?: string;
  scroll: number;
}

export type Menu = ParentMenu | MenuWithEvent | MenuWithRole | MenuSeperator;
interface BaseMenu {
  label: string;
  disabled?: boolean;
  hidden?: boolean;
}

export interface ParentMenu extends BaseMenu {
  children: Menu[];
}

export interface MenuWithRole extends BaseMenu {
  role: Electron.MenuItem["role"];
}
export interface MenuSeperator {
  type: "separator";
}

export interface MenuWithEvent<UIEvent extends UIEventType = UIEventType>
  extends BaseMenu {
  shortcut?: string;
  event: UIEvent;
  eventInput?: UIEventInput<UIEvent>;
}

export function isSeperator(m: Menu): m is MenuSeperator {
  // eslint-disable-next-line no-prototype-builtins
  return m.hasOwnProperty("type") && (m as any).type === "separator";
}

export function menuHasChildren(menu: Menu): menu is ParentMenu {
  // eslint-disable-next-line no-prototype-builtins
  return menu.hasOwnProperty("children");
}

export function menuHasRole(menu: Menu): menu is MenuWithRole {
  // eslint-disable-next-line no-prototype-builtins
  return menu.hasOwnProperty("role");
}

export function menuHasEvent(menu: Menu): menu is MenuWithEvent {
  // eslint-disable-next-line no-prototype-builtins
  return menu.hasOwnProperty("event");
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
