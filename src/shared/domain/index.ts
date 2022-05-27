import { customAlphabet } from "nanoid";
import * as yup from "yup";
import { ID_ALPHABET } from "../constants";

const ID_LENGTH = 10;
export const uuid = customAlphabet(ID_ALPHABET, ID_LENGTH);
export const UUID_REGEX = /[a-zA-Z0-9]{10}$/;

export const uuidSchema = yup
  .string()
  .required()
  .test((val) => UUID_REGEX.test(val ?? ""));

export interface Resource {
  id: string;
  dateCreated: Date;
  dateUpdated?: Date;
}
