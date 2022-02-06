import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { AwaitableInput } from "../awaitableInput";
import { Note } from "./note";
import { Notebook } from "./notebook";
import { Shortcut } from "./shortcut";
import { Tag } from "./tag";

export interface State {
  ui: UI;
  tags: Tag[];
  notes: Note[];
  notebooks: Notebook[];
  shortcuts: Shortcut[];
}

export interface UI {
  sidebar: Sidebar;
  focused: Section[];
}

export type Section =
  | "sidebar"
  | "sidebarContextMenu"
  | "sidebarInput"
  | "editor";

export interface Sidebar {
  width: string;
  scroll: number;
  filter: Filter;
  explorer: Explorer;
  hidden?: boolean;
}

export interface Filter {
  expanded?: boolean;
}

export interface Explorer {
  view: ExplorerView;
  input?: ExplorerInput;
  selected?: string[];
  expanded?: string[];
}

export interface ExplorerInput extends AwaitableInput {
  parentId?: string;
}

export interface ExplorerItem {
  id: string;
  text: string;
  children?: ExplorerItem[];
  icon?: IconDefinition;
}

export type ExplorerView =
  | "all"
  | "notebooks"
  | "tags"
  | "favorites"
  | "temp"
  | "trash";
