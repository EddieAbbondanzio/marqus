import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export interface State {
  globalNavigation: GlobalNavigation;
  tags: Tags;
  notebooks: Notebooks;
  shortcuts: Shortcuts;
}

export interface GlobalNavigation {
  width: string;
  scroll: number;
}

export interface Tags {
  values: Tag[];
}

export interface Notebook extends UserResource {
  name: string;
  expanded?: boolean;
  parent?: Notebook;
  children?: Notebook[];
}

export interface Notebooks {
  values: Notebook[];
}

export interface Shortcuts {
  values: Shortcuts[];
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

export interface Tag extends UserResource {
  name: string;
}

/**
 * Generate a new entity id.
 */
// Do not rename to id() unless you never want to use const id = id()
export const generateId = uuidv4 as () => string;

/**
 * Check if a string matches the uuid format being used.
 * @param id The id to test.
 * @returns True if the string is a v4 uuid.
 */
export function isId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    id
  );
}

export const idSchema = yup.string().optional().default(generateId).test(isId);

export const tagNameSchema = yup
  .string()
  .required("Tag is required")
  .min(1, "Tag must be atleast 1 character")
  .max(64, "Tag cannot be more than 64 characters");

export const tagSchema: yup.SchemaOf<Tag> = yup
  .object()
  .shape({
    id: idSchema,
    name: tagNameSchema,
    dateCreated: yup.date(),
    dateUpdated: yup.date().optional(),
  })
  .defined();

export const notebookSchema: yup.SchemaOf<Notebook> = yup
  .object()
  .shape({} as any);
