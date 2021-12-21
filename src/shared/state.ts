import { AwaitableInput } from "./awaitableInput";
import { KeyCode } from "./io/keyCode";

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
  filterExpanded?: boolean;
  selection?: SidebarSelection[];
  hidden?: boolean;
}
export interface SidebarSelection {
  id: string;
  type: ResouceType;
}

export interface Tag extends Resource<"tag"> {
  name: string;
}

export interface Notebook extends Resource<"notebook"> {
  name: string;
  expanded?: boolean;
  parent?: Notebook;
  children?: Notebook[];
}

// Shortcut is not a resource because they are just values
export interface Shortcut {
  // Command is of type string as /shared doesn't have access to CommandType.
  command: string;
  keys: KeyCode[];
  disabled?: boolean;
  when?: UISection;
  repeat?: boolean;
  userDefined?: boolean;
}

export enum NoteFlag {
  None,
  Favorited = 1 << 1,
  Trashed = 1 << 2,
  UnsavedChanges = 1 << 3,
}

export interface Note extends Resource<"note"> {
  name: string;
  notebooks?: string[];
  tags?: string[];
  flags?: NoteFlag;
}

export interface NoteFilter {
  id?: string;
  tag?: string[];
  notebook?: string;
}

export interface Menu extends Resource<"menu"> {
  name: string;
  menuResource: "tag" | "notebook" | "note";
  children?: Menu[];
  input?: AwaitableInput;
}

export interface Resource<Type extends ResouceType> {
  id: string;
  type: Type;
  dateCreated: Date;
  dateUpdated?: Date;
}
export type ResouceType = "tag" | "notebook" | "note" | "menu";

export function isTag(t: any): t is Tag {
  return t.type === "tag";
}

export function isNotebook(n: any): n is Notebook {
  return n.type === "notebook";
}

export function isNote(n: any): n is Note {
  return n.type === "note";
}
