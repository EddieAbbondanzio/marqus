import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

/**
 * Generate a new entity id.
 */
export const generateId = uuidv4;

/**
 * Check if a string matches the uuid format being used.
 * @param id The id to test.
 * @returns True if the string is a v4 uuid.
 */
export function isId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    id
  );
}

export const idSchema = yup
  .string()
  .optional()
  .default(generateId)
  .test(isId);
