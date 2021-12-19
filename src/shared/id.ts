import { customAlphabet, nanoid } from "nanoid";

export const ID_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Do not rename to id() unless you never want to use const id = id()
export const uuid = customAlphabet(ID_ALPHABET, 10);

/**
 * Check if a string matches the uuid format being used.
 * @param id The id to test.
 * @returns True if the string is a v4 uuid.
 */
export function isId(id: string): boolean {
  return /^[a-zA-Z\d]{10}$/.test(id);
}
