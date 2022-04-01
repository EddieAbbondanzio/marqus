import { Note } from "./note";
import { Tag } from "./tag";

export interface Resource<Type extends ResourceType> {
  id: string;
  type: Type;
  dateCreated: Date;
  dateUpdated?: Date;
}
export type ResourceType = "tag" | "note";

export function isTag(t: any): t is Tag {
  return t.type === "tag";
}

export function isNote(n: any): n is Note {
  return n.type === "note";
}
