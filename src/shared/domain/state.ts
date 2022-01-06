import { AwaitableInput } from "../awaitableInput";
import { Tag, Notebook, EntityType } from "./entities";
import { Menu, Shortcut } from "./valueObjects";

export interface State {
  ui: UI;
  tags: Tag[];
  notebooks: Notebook[];
  shortcuts: Shortcut[];
}

export interface UI {
  sidebar: Sidebar;
  focused?: UISection[];
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
  // Menus are generated on the fly in the explorer component
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
