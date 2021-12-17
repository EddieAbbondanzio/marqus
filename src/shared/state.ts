import { AwaitableInput } from "./awaitableInput";
import { KeyCode } from "./io/keyCode";

export interface State {
  ui: UI;
  tags: Tag[];
  notebooks: Notebook[];
  shortcuts: Shortcut[];
}

export interface UI {
  globalNavigation: GlobalNavigation;
  focused?: UISection[];
}

export type UISection =
  | "globalNavigation"
  | "globalNavigationContextMenu"
  | "localNavigation"
  | "editor";

export interface GlobalNavigation {
  width: string;
  scroll: number;
  tagInput?: AwaitableInput;
  selected?: string;
}

export interface Tag extends UserResource {
  name: string;
}

export interface Notebook extends UserResource {
  name: string;
  expanded?: boolean;
  parent?: Notebook;
  children?: Notebook[];
}

export interface Shortcut {
  // Command is of type string as shared doesn't have access to CommandType.
  command: string;
  keys: KeyCode[];
  disabled?: boolean;
  when?: UISection;
  repeat?: boolean;
  userDefined?: boolean;
}

export interface ShortcutOverride {
  command: string;
  keys?: string;
  disabled?: boolean;
  when?: string;
  repeat?: boolean;
}

export enum NoteFlag {
  None,
  Favorited = 1 << 1,
  Trashed = 1 << 2,
  UnsavedChanges = 1 << 3,
}

export interface Note extends UserResource {
  name: string;
  notebooks?: string[];
  tags?: string[];
  flags?: NoteFlag;
}

export interface UserResource {
  id: string;
  dateCreated: Date;
  dateUpdated?: Date;
}
