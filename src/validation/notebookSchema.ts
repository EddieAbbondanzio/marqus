import { store } from "@/store";
import { notebooks } from "@/store/modules/notebooks";
import { Notebook } from "@/store/modules/notebooks/state";
import { isBlank } from "@/utils";
import * as yup from "yup";
import { idSchema } from "./idSchema";

export const notebookNameSchema = yup
  .string()
  .test(v => !isBlank(v))
  .min(1)
  .max(64)
  .required()
  .test((v, ctx) => {
    const notebookCtx = notebooks.context(store);

    const duplicates = notebookCtx.state.values.filter(t => t.name === v);

    if (duplicates.length <= 1) {
      return true;
    }

    return ctx.createError({ message: `Notebook ${v} already exists` });
  });

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
