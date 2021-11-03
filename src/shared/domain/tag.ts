import { idSchema } from "./id";
import { UserResource } from "./userResource";
import * as yup from "yup";

export interface Tag extends UserResource {
  name: string;
}

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
