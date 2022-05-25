import { InvalidOpError, NotFoundError } from "../errors";
import * as yup from "yup";
import { idSchema, Resource, resourceId } from ".";
import { isBlank } from "../utils";
import { chain, isEmpty } from "lodash";

export enum NoteSortingAlgo {
  Alphanumeric = "alphanumeric",
  AlphanumericReversed = "alphanumericReversed",
  DateCreated = "dateCreated",
  DateCreatedReversed = "dateCreatedReversed",
  DateModified = "dateModified",
  DateModifiedReversed = "dateModifiedReversed",
  Manual = "manual",
}

export interface Note extends Resource<"note"> {
  name: string;
  tags?: string[];
  parent?: string;
  children?: Note[];
  sort?: NoteSortingAlgo;
}

export function createNote(props: Partial<Note> & { name: string }): Note {
  const note = {
    ...props,
  } as Note;

  if (isBlank(note.name)) {
    throw new InvalidOpError("Name is required.");
  }

  note.id ??= resourceId("note");
  note.type ??= "note";
  note.dateCreated ??= new Date();

  if (!isEmpty(note.children)) {
    for (const child of note.children!) {
      child.parent = note.id;
    }
  }

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
      sort: yup.mixed().optional().oneOf(Object.values(NoteSortingAlgo)),
    })
    .defined();
}

export function getNoteById(notes: Note[], id: string, required?: true): Note;
export function getNoteById(
  notes: Note[],
  id: string,
  required: false
): Note | null;
export function getNoteById(
  notes: Note[],
  id: string,
  required = true
): Note | null {
  const toVisit = [...notes];

  for (let i = 0; i < toVisit.length; i++) {
    const note = toVisit[i];
    if (note.id === id) {
      return note;
    }

    if (!isEmpty(note.children)) {
      toVisit.push(...note.children!);
    }
  }

  if (required) {
    throw new NotFoundError(`No note with id ${id} found.`);
  } else {
    return null;
  }
}

export function flatten(notes: Note[]): Note[] {
  const flatNotes = [];

  const recursivelyFlatten = (note: Note): void =>
    void chain(note.children)
      .forEach((c) => {
        flatNotes.push(c);
      })
      .forEach((c) => {
        recursivelyFlatten(c);
      })
      .attempt()
      .value();

  for (const root of notes) {
    flatNotes.push(root);
    recursivelyFlatten(root);
  }

  return flatNotes;
}
