import { customAlphabet } from "nanoid";
import * as yup from "yup";
import { ID_ALPHABET } from "../constants";

const ID_LENGTH = 10;
const _uuid = customAlphabet(ID_ALPHABET, ID_LENGTH);
export const UUID_REGEX = /[a-zA-Z0-9]{10}$/;
const RESOURCE_REGEX = /^(tag|note).[a-zA-Z0-9]{10}$/;

export function resourceId(type: ResourceType, id?: string): string {
  return `${type}.${id ?? _uuid()}`;
}

export function isResourceId(id: string): boolean {
  return RESOURCE_REGEX.test(id);
}

export function parseResourceId(id: string): [ResourceType, string] {
  if (!isResourceId(id)) {
    throw Error(`Invalid global id ${id}`);
  }

  const split = id.split(".") as [ResourceType, string];
  return split;
}

export const idSchema = yup
  .string()
  .required()
  .test((val) => UUID_REGEX.test(val ?? ""));

export interface Resource<Type extends ResourceType> {
  id: string;
  type: Type;
  dateCreated: Date;
  dateUpdated?: Date;
}
export type ResourceType = "tag" | "note";
