import { parseJSON } from "date-fns";
import { customAlphabet } from "nanoid";
import { z } from "zod";

const ID_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const ID_LENGTH = 10;

export const uuid = customAlphabet(ID_ALPHABET, ID_LENGTH);
export const UUID_REGEX = /[a-zA-Z0-9]{10}$/;

export const UUID_SCHEMA = z.string().refine((val) => UUID_REGEX.test(val));
export const DATE_OR_STRING_SCHEMA = z.union([
  z.date(),
  z.string().transform((v) => parseJSON(v)),
]);

export interface Resource {
  id: string;
  dateCreated: Date;
  dateUpdated?: Date;
}
