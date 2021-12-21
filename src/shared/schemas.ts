import * as yup from "yup";
import { Notebook, Shortcut, Tag, UI } from "./state";
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
    filterExpanded: yup.boolean().optional(),
    tagInput: yup
      .object()
      .shape({
        inputMode: yup.string().oneOf(["create", "update"]),
      })
      .optional(),
    selection: yup.array().optional(), // TODO: Fix this
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
  when: yup.string().optional().oneOf(["sidebar", "editor"]) as any,
  repeat: yup.bool().optional(),
  userDefined: yup.bool().optional(),
});
