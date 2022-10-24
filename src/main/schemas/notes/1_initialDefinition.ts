import { z } from "zod";
import { UUID_SCHEMA, DATE_OR_STRING_SCHEMA } from "../../../shared/domain";
import { NoteSort } from "../../../shared/domain/note";

export interface NoteV1 {
  id: string;
  version: number;
  name: string;
  parent?: string;
  sort?: NoteSort;
}

export const noteSchemaV1 = z.object({
  version: z.literal(1),
  id: UUID_SCHEMA,
  // Name is not unique because it's difficult to enforce uniqueness when
  // notes can change parents. There's no real harm in having duplicates.
  name: z
    .string()
    .min(1, "Name must be at least 1 char long")
    .max(64, "Name must be 64 chars or less."),
  flags: z.number().optional(),
  dateCreated: DATE_OR_STRING_SCHEMA,
  dateUpdated: DATE_OR_STRING_SCHEMA.optional(),
  sort: z.nativeEnum(NoteSort).optional(),
  parent: UUID_SCHEMA.optional(),
});
