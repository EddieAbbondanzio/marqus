import { PromisedInput } from "../awaitableInput";
import { Note } from "./note";
import { Shortcut } from "./shortcut";
import { Tag } from "./tag";

export interface State {
  ui: UI;
  tags: Tag[];
  notes: Note[];
  shortcuts: Shortcut[];
}

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
