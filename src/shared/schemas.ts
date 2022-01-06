import * as yup from "yup";
import { Tag, Notebook } from "./domain/entities";
import { UI } from "./domain/state";
import { Shortcut } from "./domain/valueObjects";
import { uuid, isId } from "./utils";

const idSchema = yup.string().optional().default(uuid).test(isId);

export function getTagSchema(tags: Tag[] = []): yup.SchemaOf<Tag> {
  return yup
    .object()
    .shape({
      id: idSchema,
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

export const uiSchema: yup.SchemaOf<UI> = yup.object().shape({
  sidebar: yup.object().shape({
    width: yup.string().required(),
    scroll: yup.number().required().min(0),
    filter: yup.object().shape({
      expanded: yup.boolean().optional(),
    }),
    explorer: yup.object().shape({
      view: yup
        .mixed()
        .oneOf(["all", "notebooks", "tags", "favorites", "temp", "trash"])
        .required(),
      menus: yup.array(),
      input: yup
        .object()
        .shape({
          id: idSchema,
          mode: yup.mixed().oneOf(["create", "update"]),
          value: yup.string() as yup.StringSchema<string>,
          onInput: yup.mixed(),
          confirm: yup.mixed(),
          cancel: yup.mixed(),
          parent: yup
            .object()
            .shape({
              id: idSchema,
              type: yup.mixed().oneOf(["note", "notebook", "tag"]),
            })
            .optional(),
        })
        .default(undefined)
        .optional(),
    }),
    tagInput: yup
      .object()
      .shape({
        inputMode: yup.mixed().oneOf(["create", "update"]),
      })
      .optional(),
    hidden: yup.boolean().optional(),
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
