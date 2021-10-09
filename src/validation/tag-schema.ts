import { store } from "@/store";
import { tags } from "@/store/modules/tags";
import { Tag } from "@/store/modules/tags/state";
import { isBlank } from "@/utils";
import * as yup from "yup";
import { idSchema } from "./id-schema";

export const tagNameSchema = yup
  .string()
  .required("Tag is required")
  .test((v, ctx) => {
    if (isBlank(v)) {
      return ctx.createError({ message: "Tag cannot be blank" });
    }

    return true;
  })
  .min(1, "Tag must be atleast 1 character")
  .max(64, "Tag cannot be more than 64 characters")
  .test((v, ctx) => {
    const tagCtx = tags.context(store);

    const duplicates = tagCtx.state.values.filter(t => t.name === v);

    if (duplicates.length <= 1) {
      return true;
    }

    return ctx.createError({ message: `Tag ${v} already exists` });
  });

export const tagSchema: yup.SchemaOf<Tag> = yup
  .object()
  .shape({
    id: idSchema,
    name: tagNameSchema
  })
  .defined();
