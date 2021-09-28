import { Entity, generateId } from "@/utils/entity";
import { isBlank } from "@/utils/string";
import * as yup from "yup";

export interface Note extends Entity {
  name: string;
  notebooks?: string[];
  tags?: string[];
  dateCreated: Date;
  dateModified?: Date;
  /**
   * Was this note moved to the trash bin?
   */
  trashed?: boolean;
  /**
   * If the user starred the note.
   */
  favorited?: boolean;
  /**
   * If the note has been modified in some way since the last
   * time it was saved to the file system.
   */
  hasUnsavedChanges?: boolean;
}

export const noteSchema: yup.SchemaOf<Note> = yup
  .object()
  .shape({
    id: yup
      .string()
      .optional()
      .default(generateId),
    name: yup
      .string()
      .test(v => !isBlank(v))
      .min(1)
      .max(128)
      .required(),
    notebooks: yup.array().default([]),
    tags: yup.array().default([]),
    dateCreated: yup.date().default(new Date()),
    dateModified: yup.date().optional(),
    trashed: yup.boolean().optional(),
    favorited: yup.boolean().optional(),
    hasUnsavedChanges: yup.boolean().optional()
  })
  .defined();

export class NoteState {
  values: Note[] = [];
}
