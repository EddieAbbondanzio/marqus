import { customAlphabet } from "nanoid";
import { z } from "zod";

const ID_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const ID_LENGTH = 10;

export const uuid = customAlphabet(ID_ALPHABET, ID_LENGTH);
export const UUID_REGEX = /[a-zA-Z0-9]{10}$/;

export const UUID_SCHEMA = z.string().refine((val) => UUID_REGEX.test(val));

export interface Resource {
  id: string;
  dateCreated: Date;
  dateUpdated?: Date;
}
