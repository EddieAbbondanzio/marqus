import { Entity, generateId } from "@/utils/entity";
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
      .min(1)
      .max(64)
      .required()
  })
  .defined();
