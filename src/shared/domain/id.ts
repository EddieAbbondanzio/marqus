import { customAlphabet } from "nanoid";
import { ResourceType } from "./types";
import * as yup from "yup";

const ID_LENGTH = 10;
const ID_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Only use this for infrastructure code.
const _uuid = customAlphabet(ID_ALPHABET, ID_LENGTH);
export const UUID_REGEX = /[a-zA-Z0-9]{10}$/;
const RESOURCE_REGEX = /^(tag|note).[a-zA-Z0-9]{10}$/;

export function resourceId(type: ResourceType, id?: string) {
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
