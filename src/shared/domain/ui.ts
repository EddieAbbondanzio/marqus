import { PromisedInput } from "../awaitableInput";

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
type ChildApplicationMenu = BaseApplicationMenu & {
  shortcut?: string;
  event: string;
  eventInput?: any;
};

export function menuHasChildren(
  menu: ApplicationMenu
): menu is ParentApplicationMenu {
  // eslint-disable-next-line no-prototype-builtins
  return menu.hasOwnProperty("children");
}
