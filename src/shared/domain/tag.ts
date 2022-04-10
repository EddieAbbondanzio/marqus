import { InvalidOpError, NotFoundError } from "../errors";
import * as yup from "yup";
import { idSchema, Resource, resourceId } from ".";
import { isBlank } from "../utils";

export interface Tag extends Resource<"tag"> {
  name: string;
}

export function createTag(props: Partial<Tag>): Tag {
  const tag = {
    ...props,
  } as Tag;

  if (isBlank(tag.name)) {
    throw new InvalidOpError("Name is required.");
  }

  tag.id ??= resourceId("tag");
  tag.type ??= "tag";
  tag.dateCreated ??= new Date();

  return tag;
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
