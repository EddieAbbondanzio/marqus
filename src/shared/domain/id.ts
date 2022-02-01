import { customAlphabet } from "nanoid";
import { Note } from "./note";
import { ExplorerView, ExplorerItem } from "./state";
import { EntityType } from "./types";
import * as yup from "yup";

export const ID_LENGTH = 10;
export const ID_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Do not rename to id() unless you never want to use const id = id()
export const uuid = customAlphabet(ID_ALPHABET, ID_LENGTH);

/**
 * Check if a string matches the uuid format being used.
 * @param id The id to test.
 * @returns True if the string is a v4 uuid.
 */
export function isId(id: string): boolean {
  return /^[a-zA-Z\d]{10}$/.test(id);
}

export function globalId(type: EntityType, id: string) {
  return `${type}.${id}`;
}

export function parseGlobalId(globalId: string): [EntityType, string] {
  if (!/^(tag|notebook|note).[a-zA-Z0-9]{10}$/.test(globalId)) {
    throw Error(`Invalid global id ${globalId}`);
  }

  const split = globalId.split(".") as [EntityType, string];
  return split;
}

export const idSchema = yup.string().required().test(isId);
