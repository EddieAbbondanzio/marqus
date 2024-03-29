import { Resource, uuid } from ".";
import { isBlank } from "../utils";
import { isEmpty, orderBy, reverse } from "lodash";
import { z } from "zod";

export interface Note extends Resource {
  version: number;
  name: string;
  parent?: string;
  children: Note[];
  sort?: NoteSort;
  content: string;
}

export enum NoteSort {
  Alphanumeric = "alphanumeric",
  AlphanumericReversed = "alphanumericReversed",
  DateCreated = "dateCreated",
  DateCreatedReversed = "dateCreatedReversed",
  DateUpdated = "dateModified",
  DateUpdatedReversed = "dateUpdatedReversed",
}

export const NOTE_SORT_LABELS: Record<NoteSort, string> = {
  [NoteSort.Alphanumeric]: "A - Z",
  [NoteSort.AlphanumericReversed]: "Z - A",
  [NoteSort.DateCreated]: "Newest",
  [NoteSort.DateCreatedReversed]: "Oldest",
  [NoteSort.DateUpdated]: "Last Modified",
  [NoteSort.DateUpdatedReversed]: "First Modified",
};

export const DEFAULT_NOTE_SORTING_ALGORITHM = NoteSort.Alphanumeric;

/**
 * Sort notes based on one of the sorting algorithms. Works recursively.
 * @param notes The notes to sort.
 * @param sort The algorithm to use.
 * @returns The sorted notes.
 */
export function sortNotes(notes: Note[], sort: NoteSort): Note[] {
  const r = (notes: Note[], sort: NoteSort) => {
    for (const n of notes) {
      if (n.children) {
        // Parent notebook sort takes precedence, otherwise we'll use the last
        // sort method (global, or a higher parent's sort).
        r(n.children, n.sort ?? sort);
      }
    }

    switch (sort) {
      case NoteSort.Alphanumeric:
        return notes.sort((a, b) =>
          a.name
            .toLowerCase()
            .localeCompare(b.name.toLowerCase(), undefined, { numeric: true }),
        );

      case NoteSort.AlphanumericReversed:
        return notes.sort((a, b) =>
          b.name
            .toLowerCase()
            .localeCompare(a.name.toLowerCase(), undefined, { numeric: true }),
        );

      case NoteSort.DateCreated:
        return orderBy(notes, ["dateCreated"], ["desc"]);

      case NoteSort.DateCreatedReversed:
        return orderBy(notes, ["dateCreated"], ["asc"]);

      case NoteSort.DateUpdated:
        // Use created date as tie breaker
        return orderBy(notes, ["dateUpdated", "dateCreated"], ["asc", "asc"]);

      case NoteSort.DateUpdatedReversed:
        // Use created date as tie breaker
        return orderBy(notes, ["dateUpdated", "dateCreated"], ["desc", "desc"]);

      default:
        throw new Error(`Invalid note sorting algorithm: ${sort}`);
    }
  };

  return r(notes, sort);
}

export function createNote(props: Partial<Note> & Pick<Note, "name">): Note {
  const note = {
    ...props,
  } as Note;

  if (isBlank(note.name)) {
    throw new Error("Name is required.");
  }

  note.id ??= uuid();
  note.dateCreated ??= new Date();
  note.content ??= `# ${note.name}`;

  // Trim out null parent id
  if (note.parent === null) {
    delete note.parent;
  }

  if (!isEmpty(note.children)) {
    for (const child of note.children!) {
      child.parent = note.id;
    }
  } else {
    note.children = [];
  }

  return note;
}

export const NOTE_NAME_SCHEMA = z
  .string()
  .min(1, "Name must be at least 1 char long")
  .max(64, "Name must be 64 chars or less.");

/**
 * Recursively search for a note based on it's id.
 * @param notes The notes to look through.
 * @param id The id of the note to find.
 * @param required If we expect to find the note and should error otherwise.
 */
export function getNoteById(notes: Note[], id: string, required?: true): Note;
export function getNoteById(
  notes: Note[],
  id: string,
  required: false,
): Note | null;
export function getNoteById(
  notes: Note[],
  id: string,
  required = true,
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
    throw new Error(`No note with id ${id} found.`);
  } else {
    return null;
  }
}

export function getNoteByPath(
  notes: Note[],
  path: string,
  required?: true,
): Note;
export function getNoteByPath(
  notes: Note[],
  path: string,
  required: false,
): Note | null;
export function getNoteByPath(
  notes: Note[],
  path: string,
  required = true,
): Note | null {
  const pathArray = path.replace("note://", "").split("/");

  let currNote: Note | null = null;
  do {
    const currPath = pathArray.shift();
    let currNotesToCheck = notes;

    if (currNote != null && currNote.children.length > 0) {
      currNotesToCheck = currNote.children;
    }

    currNote = currNotesToCheck.find(n => n.name === currPath) ?? null;
  } while (pathArray.length > 0 && currNote != null);

  if (required && currNote == null) {
    throw new Error(`Note with path ${path} not found.`);
  }

  return currNote;
}

/**
 * Flatten nested notes into a 1d array.
 * @param notes Tree of notes
 * @returns All of the notes flattened into one array.
 */
export function flatten(notes: Note[]): Note[] {
  // Order is important here. We use this for moving the sidebars selection up
  // and down so by going in a breadth first fashion we can easily support
  // moving the selection without any complex math.

  const flatNotes: Note[] = [];

  const r = (note: Note) => {
    flatNotes.push(note);
    note.children?.forEach(r);
  };
  notes.forEach(r);

  return flatNotes;
}

/**
 * Generate an array containing every parent of a note in order from closest ->
 * furthest.
 * @param note The note to get parents for.
 * @param notes Collection of every note.
 * @returns An array of all the parents.
 */
export function getParents(note: Note, notes: Note[]): Note[] {
  const flat = flatten(notes);
  const parents = [];
  const next = [note];
  for (let i = 0; i < next.length; i++) {
    const n = next[i];
    let p;

    if (n.parent != null) {
      p = flat.find(p => p.id === n.parent);

      if (p == null) {
        throw new Error(`Could not find parent note with id ${n.parent}.`);
      }

      next.push(p);
      parents.push(p);
    }
  }

  return parents;
}

export function getFullPath(notes: Note[], note: Note): string {
  return [...reverse(getParents(note, notes).map(n => n.name)), note.name].join(
    "/",
  );
}
