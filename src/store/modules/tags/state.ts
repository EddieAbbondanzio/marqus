import { Entity, generateId } from "@/utils/entity";
import { isBlank } from "@/utils/string";
import * as yup from "yup";

export interface Tag extends Entity {
  name: string;
}

export class TagState {
  values: Tag[] = [];
}

export const tagSchema: yup.SchemaOf<Tag> = yup
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
      .max(64)
      .required()
  })
  .defined();
