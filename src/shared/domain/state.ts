import { AwaitableInput } from "../awaitableInput";
import { Tag, Notebook, EntityType, Note } from "./entities";
import { Shortcut } from "./valueObjects";

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
}

export interface ExplorerInput extends AwaitableInput {
  parentId?: string;
}

export type ExplorerView =
  | "all"
  | "notebooks"
  | "tags"
  | "favorites"
  | "temp"
  | "trash";
