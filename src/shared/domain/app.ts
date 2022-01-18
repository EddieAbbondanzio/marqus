import { AwaitableInput } from "../awaitableInput";
import { Tag, Notebook, EntityType } from "./entities";
import { Shortcut } from "./valueObjects";

/**
 * AppState is all things related to the user interface.
 */
// Entities do not belong here.
export interface App {
  sidebar: Sidebar;
  focused: Section[];
}

export type Section = "sidebar" | "sidebarContextMenu" | "editor";

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
  items?: ExplorerItem[];
}

export interface ExplorerInput extends AwaitableInput {
  parent?: {
    id: string;
    type: EntityType;
  };
}

export interface ExplorerItem {
  text: string;
  resourceId: string;
  resourceType: "tag" | "notebook" | "note";
  children?: ExplorerItem[];
}

export type ExplorerView =
  | "all"
  | "notebooks"
  | "tags"
  | "favorites"
  | "temp"
  | "trash";
