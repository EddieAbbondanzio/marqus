import { UserResource } from "./userResource";

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
