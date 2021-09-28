import { Base } from "@/store/base";
import { idSchema } from "@/utils/id";
import { isBlank } from "@/utils/string";
import * as yup from "yup";

export interface Tag extends Base {
  name: string;
}

export class TagState {
  values: Tag[] = [];
}

export const tagNameSchema = yup
  .string()
  .test(v => !isBlank(v))
  .min(1)
  .max(64)
  .required();

export const tagSchema: yup.SchemaOf<Tag> = yup
  .object()
  .shape({
    id: idSchema,
    name: tagNameSchema
  })
  .defined();
