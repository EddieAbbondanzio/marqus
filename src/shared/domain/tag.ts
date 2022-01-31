import { NotFoundError } from "../errors";
import { Entity } from "./types";
import * as yup from "yup";
import { idSchema } from "./id";

export interface Tag extends Entity<"tag"> {
  name: string;
}

export function getTagSchema(tags: Tag[] = []): yup.SchemaOf<Tag> {
  return yup
    .object()
    .shape({
      id: idSchema,
      type: yup.string().required().equals(["tag"]),
      name: yup
        .string()
        .required("Tag is required")
        .min(1, "Tag must be atleast 1 character")
        .max(64, "Tag cannot be more than 64 characters")
        .notOneOf(
          tags.map((t) => t.name),
          "Tag already exists"
        ),
      dateCreated: yup.date(),
      dateUpdated: yup.date().optional(),
    })
    .defined();
}

export function getTagById(tags: Tag[], id: string): Tag {
  const tag = tags.find((t) => t.id === id);
  if (tag == null) {
    throw new NotFoundError(`No tag with id ${id} found.`);
  }

  return tag;
}
