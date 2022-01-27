import * as yup from "yup";
import { Tag, Notebook, Note } from "./entities";
import { UI } from "./state";
import { Shortcut } from "./valueObjects";
import { uuid, isId } from "../utils";

const id = yup.string().optional().default(uuid).test(isId);

export function getTagSchema(tags: Tag[] = []): yup.SchemaOf<Tag> {
  return yup
    .object()
    .shape({
      id: id,
      type: yup.string().required().equals(["tag"]),
      name: yup
        .string()
        .required("Tag is required")
        .min(1, "Tag must be atleast 1 character")
        .max(64, "Tag cannot be more than 64 characters")
        .notOneOf(
          tags.map((t) => t.name),
          "Tag already exists"
        ),
      dateCreated: yup.date(),
      dateUpdated: yup.date().optional(),
    })
    .defined();
}

export function getNoteSchema(notes: Note[] = []): yup.SchemaOf<Note> {
  return yup
    .object()
    .shape({
      id,
      type: yup.string().required().equals(["note"]),
      name: yup
        .string()
        .required()
        .min(1, "Note name must be atleast 1 character")
        .max(64, "Note name cannot be more than 64 characters"),
      tags: yup.array().of(yup.string()).optional(),
      notebooks: yup.array().of(yup.string()).optional(),
      flags: yup.number(),
      dateCreated: yup.date().required(),
      dateUpdated: yup.date().optional(),
    })
    .defined();
}

export const notebookSchema: yup.SchemaOf<Notebook> = yup
  .object()
  .shape({} as any);

export const shortcutSchema: yup.SchemaOf<Shortcut> = yup.object().shape({
  command: yup.string().required(),
  keys: yup.array(),
  disabled: yup.boolean().optional(),
  when: yup.mixed().optional().oneOf(["sidebar", "editor"]),
  repeat: yup.bool().optional(),
  userDefined: yup.bool().optional(),
});
