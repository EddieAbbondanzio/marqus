import { Notebook } from "@/store/modules/notebooks/state";
import { isBlank } from "@/utils";
import * as yup from "yup";
import { idSchema } from "./id-schema";

export const notebookNameSchema = yup
  .string()
  .test(v => !isBlank(v))
  .min(1)
  .max(64)
  .required();

export const notebookSchema: yup.SchemaOf<Notebook> = yup
  .object()
  .shape({
    id: idSchema,
    name: notebookNameSchema,
    parent: yup.object().optional(),
    children: yup
      .array()
      .optional()
      .default([]),
    expanded: yup
      .boolean()
      .optional()
      .default(false)
  })
  .defined();
