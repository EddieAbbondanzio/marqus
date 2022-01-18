import * as yup from "yup";
import { Tag, Notebook } from "./entities";
import { App } from "./app";
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

export const notebookSchema: yup.SchemaOf<Notebook> = yup
  .object()
  .shape({} as any);

export const appSchema: yup.SchemaOf<App> = yup.object().shape({
  sidebar: yup.object().shape({
    width: yup.string().required(),
    scroll: yup.number().required().min(0),
    hidden: yup.boolean().optional(),
    filter: yup.object().shape({
      expanded: yup.boolean().optional(),
    }),
    explorer: yup.object().shape({
      items: yup.mixed().optional(), // Not
      view: yup
        .mixed()
        .oneOf(["all", "notebooks", "tags", "favorites", "temp", "trash"])
        .required(),
      selected: yup.array(), // Not persisted
      input: yup
        .object()
        .shape({
          id: id,
          mode: yup.mixed().oneOf(["create", "update"]),
          value: yup.string() as yup.StringSchema<string>,
          onInput: yup.mixed(),
          confirm: yup.mixed(),
          cancel: yup.mixed(),
          parent: yup
            .object()
            .shape({
              id: id,
              type: yup.mixed().oneOf(["note", "notebook", "tag"]),
            })
            .optional(),
        })
        .default(undefined)
        .optional(),
    }),
  }),
  focused: yup
    .array()
    .of(yup.string().oneOf(["sidebar", "sidebarContextMenu", "editor"]))
    .nullable()
    .optional(),
});

export const shortcutSchema: yup.SchemaOf<Shortcut> = yup.object().shape({
  command: yup.string().required(),
  keys: yup.array(),
  disabled: yup.boolean().optional(),
  when: yup.mixed().optional().oneOf(["sidebar", "editor"]),
  repeat: yup.bool().optional(),
  userDefined: yup.bool().optional(),
});
