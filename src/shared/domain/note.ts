import { NotFoundError } from "../errors";
import { Entity } from "./types";

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

export function getNoteById(notes: Note[], id: string): Note {
  const note = notes.find((n) => n.id === id);
  if (note == null) {
    throw new NotFoundError(`No note with id ${id} found.`);
  }
  return note;
}

export function getNotesForTag(notes: Note[], tagId: string) {
  return notes.filter((n) => n.tags?.some((t) => t === tagId));
}
