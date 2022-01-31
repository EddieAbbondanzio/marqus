import { NotFoundError } from "../errors";
import { Entity } from "./types";

export interface Tag extends Entity<"tag"> {
  name: string;
}

export function getTagById(tags: Tag[], id: string): Tag {
  const tag = tags.find((t) => t.id === id);
  if (tag == null) {
    throw new NotFoundError(`No tag with id ${id} found.`);
  }

  return tag;
}
