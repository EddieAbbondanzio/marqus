import { Point } from "electron";
import { PromisedInput } from "../promisedInput";

export interface UI {
  sidebar: Sidebar;
  editor: Editor;
  focused: Section[];
}

export const ALL_SECTIONS = [
  "sidebar",
  "contextMenu",
  "sidebarInput",
  "editor",
] as const;
export type Section = typeof ALL_SECTIONS[number];

export interface Sidebar {
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
}

export type ApplicationMenu =
  | ParentApplicationMenu
  | ApplicationMenuWithEvent
  | ApplicationMenuWithRole
  | ApplicationMenuSeperator;
interface BaseApplicationMenu {
  label: string;
  disabled?: boolean;
}

export interface ParentApplicationMenu extends BaseApplicationMenu {
  children: ApplicationMenu[];
}

export interface ApplicationMenuWithRole extends BaseApplicationMenu {
  role: Electron.MenuItem["role"];
}
export interface ApplicationMenuSeperator {
  type: "separator";
}

export interface ApplicationMenuWithEvent<
  UIEvent extends UIEventType = UIEventType
> extends BaseApplicationMenu {
  shortcut?: string;
  event: UIEvent;
  eventInput?: UIEventInput<UIEvent>;
}

export function isSeperator(m: ApplicationMenu): m is ApplicationMenuSeperator {
  // eslint-disable-next-line no-prototype-builtins
  return m.hasOwnProperty("type") && (m as any).type === "separator";
}

export function menuHasChildren(
  menu: ApplicationMenu
): menu is ParentApplicationMenu {
  // eslint-disable-next-line no-prototype-builtins
  return menu.hasOwnProperty("children");
}

export function menuHasRole(
  menu: ApplicationMenu
): menu is ApplicationMenuWithRole {
  // eslint-disable-next-line no-prototype-builtins
  return menu.hasOwnProperty("role");
}

export function menuHasEvent(
  menu: ApplicationMenu
): menu is ApplicationMenuWithEvent {
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
  "sidebar.toggleItemExpanded": string;
  "sidebar.moveSelectionUp": void;
  "sidebar.moveSelectionDown": void;

  // Editor
  "editor.save": void;
  "editor.toggleView": void;
  "editor.setContent": string;
  "editor.loadNote": string;

  // Focus Tracker
  "focus.push": Section;
  "focus.pop": void;

  // Context Menu
  "contextMenu.blur": void;
  "contextMenu.run": void;
  "contextMenu.moveSelectionUp": void;
  "contextMenu.moveSelectionDown": void;
}
export type UIEventType = keyof UIEvents;
export type UIEventInput<Ev extends UIEventType> = UIEvents[Ev];
