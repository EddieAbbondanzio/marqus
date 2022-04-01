import { InvalidOpError, NotFoundError } from "../errors";
import { Resource } from "./types";
import * as yup from "yup";
import { idSchema, resourceId } from "./id";
import { isBlank } from "../utils";

export enum NoteFlag {
  None,
  Favorited = 1 << 1,
  Trashed = 1 << 2,
  UnsavedChanges = 1 << 3,
}

export interface Note extends Resource<"note"> {
  name: string;
  tags?: string[];
  flags?: NoteFlag;
  parent?: string;
  children?: Note[];
}

export function createNote(props: Partial<Note>): Note {
  const note = {
    ...props,
  } as Note;

  if (isBlank(note.name)) {
    throw new InvalidOpError("Name is required.");
  }

  note.id ??= resourceId("note");
  note.type ??= "note";
  note.dateCreated ??= new Date();

  return note;
}

export function getNoteSchema(): yup.SchemaOf<Note> {
  return yup
    .object()
    .shape({
      id: idSchema,
      type: yup.string().required().equals(["note"]),
      name: yup
        .string()
        .required("Name is required.")
        .min(1, "Note name must be atleast 1 character.")
        .max(64, "Note name cannot be more than 64 characters."),
      // Note names don't need to be unique
      tags: yup.array().of(yup.string()).optional(),
      flags: yup.number(),
      dateCreated: yup.date().required(),
      dateUpdated: yup.date().optional(),
    })
    .defined();
}

export function getNoteById(notes: Note[], id: string): Note {
  const note = notes.find((n) => n.id === id);
  if (note == null) {
    throw new NotFoundError(`No note with id ${id} found.`);
  }
  return note;
}
