import { Base } from "@/store/base";
import { idSchema, isBlank } from "@/utils";
import * as yup from "yup";

export interface Tag extends Base {
  name: string;
}

export class TagState {
  values: Tag[] = [];
}

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
  .max(64, "Tag cannot be more than 64 characters");

export const tagSchema: yup.SchemaOf<Tag> = yup
  .object()
  .shape({
    id: idSchema,
    name: tagNameSchema
  })
  .defined();
