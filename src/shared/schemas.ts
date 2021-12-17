import * as yup from "yup";
import { uuid, isId } from "./id";
import { Notebook, Shortcut, Tag, UI } from "./state";

const idSchema = yup.string().optional().default(uuid).test(isId);

export function getTagSchema(tags: Tag[] = []): yup.SchemaOf<Tag> {
  return yup
    .object()
    .shape({
      id: idSchema,
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
  globalNavigation: yup.object().shape({
    width: yup.string().required(),
    scroll: yup.number().required().min(0),
    tagInput: yup
      .object()
      .shape({
        inputMode: yup.string().oneOf(["create", "update"]),
      })
      .optional(),
    selected: yup.string().optional(),
  }),
  focused: yup.object().optional().nullable() as any,
  // .optional()
  // .oneOf([
  // "globalNavigation",
  // "globalNavigationContextMenu",
  // "localNavigation",
  // "editor",
  // ]) as any,
});

export const shortcutSchema: yup.SchemaOf<Shortcut> = yup.object().shape({
  command: yup.string().required(),
  keys: yup.array(),
  disabled: yup.boolean().optional(),
  when: yup
    .string()
    .optional()
    .oneOf(["globalNavigation", "localNavigation", "editor"]) as any,
  repeat: yup.bool().optional(),
  userDefined: yup.bool().optional(),
});
