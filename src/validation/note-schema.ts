import { Note } from "@/store/modules/notes/state";
import { isBlank } from "@/utils";
import * as yup from "yup";
import { idSchema } from "./id-schema";

export const noteNameSchema = yup
  .string()
  .test(v => !isBlank(v))
  .min(1)
  .max(128)
  .required();

export const noteSchema: yup.SchemaOf<Note> = yup
  .object()
  .shape({
    id: idSchema,
    name: noteNameSchema,
    notebooks: yup.array().default([]),
    tags: yup.array().default([]),
    dateCreated: yup.date().default(new Date()),
    dateModified: yup.date().optional(),
    trashed: yup.boolean().optional(),
    favorited: yup.boolean().optional(),
    hasUnsavedChanges: yup.boolean().optional()
  })
  .defined();
