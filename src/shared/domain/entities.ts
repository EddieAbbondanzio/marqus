export interface Entity<Type extends EntityType> {
  id: string;
  type: Type;
  dateCreated: Date;
  dateUpdated?: Date;
}
export type EntityType = "tag" | "notebook" | "note";

export interface Tag extends Entity<"tag"> {
  name: string;
}

export interface Notebook extends Entity<"notebook"> {
  name: string;
  expanded?: boolean;
  parent?: Notebook;
  children?: Notebook[];
}

export enum NoteFlag {
  None,
  Favorited = 1 << 1,
  Trashed = 1 << 2,
  UnsavedChanges = 1 << 3,
}

export interface Note extends Entity<"note"> {
  name: string;
  notebooks?: string[];
  tags?: string[];
  flags?: NoteFlag;
}

export function isTag(t: any): t is Tag {
  return t.type === "tag";
}

export function isNotebook(n: any): n is Notebook {
  return n.type === "notebook";
}

export function isNote(n: any): n is Note {
  return n.type === "note";
}
