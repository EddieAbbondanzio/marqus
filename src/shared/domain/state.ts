import { AwaitableInput } from "../awaitableInput";
import { Tag, Notebook, EntityType } from "./entities";
import { Shortcut } from "./valueObjects";

export interface State {
  ui: UI;
  // tags: Tag[];
  // notebooks: Notebook[];
  // shortcuts: Shortcut[];
}

export interface UI {
  sidebar: Sidebar;
  focused: UISection[];
}

export type UISection = "sidebar" | "sidebarContextMenu" | "editor";

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
  parent?: {
    id: string;
    type: EntityType;
  };
}

export type ExplorerView =
  | "all"
  | "notebooks"
  | "tags"
  | "favorites"
  | "temp"
  | "trash";
