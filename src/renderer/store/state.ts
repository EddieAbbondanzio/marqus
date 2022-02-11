import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { AwaitableInput } from "../../shared/awaitableInput";
import { Note } from "../../shared/domain/note";
import { Notebook } from "../../shared/domain/notebook";
import { Shortcut } from "../../shared/domain/shortcut";
import { Tag } from "../../shared/domain/tag";

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

export type Section = "sidebar" | "contextMenu" | "sidebarInput" | "editor";

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
