import { max } from "lodash";
import { z } from "zod";

export function getLatestSchemaVersion(
  schemas: Record<number, z.ZodSchema<unknown>>,
): number {
  const keys = Object.keys(schemas).map(k => Number.parseInt(k, 10));

  if (keys.length === 0) {
    throw new Error(`Schema object was empty.`);
  }

  return max(keys)!;
}
