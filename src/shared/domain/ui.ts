import { PromisedInput } from "../awaitableInput";
import { Coord } from "../dom";

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

export type ApplicationMenu = ParentApplicationMenu | ChildApplicationMenu;
interface BaseApplicationMenu {
  label: string;
}

type ParentApplicationMenu = BaseApplicationMenu & {
  children: ApplicationMenu[];
};
type ChildApplicationMenu<EType extends UIEventType = UIEventType> =
  BaseApplicationMenu & {
    shortcut?: string;
    event: EType;
    eventInput?: UIEventInput<EType>;
  };

export function menuHasChildren(
  menu: ApplicationMenu
): menu is ParentApplicationMenu {
  // eslint-disable-next-line no-prototype-builtins
  return menu.hasOwnProperty("children");
}

/*
 * Events are defined in shared so we can keep shortcuts and application menus
 * type safe.
 */
export interface UIEvents {
  // Global
  "app.openDataDirectory": void;
  "app.openDevTools": void;
  "app.reload": void;
  "app.toggleFullScreen": void;
  "app.inspectElement": Coord;
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
