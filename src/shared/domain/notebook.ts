import { NotFoundError } from "../errors";
import { Entity } from "./types";
import * as yup from "yup";
import { idSchema } from "./id";

export interface Notebook extends Entity<"notebook"> {
  name: string;
  expanded?: boolean;
  parent?: Notebook;
  children?: Notebook[];
}

export function getNotebookSchema(
  notebooks: Notebook[] = []
): yup.SchemaOf<Notebook> {
  const schema: yup.SchemaOf<Notebook> = yup
    .object()
    .shape({
      id: idSchema,
      type: yup.string().required().equals(["notebook"]),
      name: yup
        .string()
        .required("Notebook is required")
        .min(1, "Notebook must be atleast 1 character")
        .max(64, "Notebook cannot be more than 64 characters")
        .test("unique-name", "Notebook already exists", (name, ctx) => {
          // Parent will be the notebook object.
          const notebook = ctx.parent as Notebook;
          const siblings = notebook.parent?.children ?? notebooks;
          return !siblings.some((s) => s.name === name && s.id !== notebook.id);
        }),
      dateCreated: yup.date().required(),
      dateUpdated: yup.date().optional(),
      // We ignore parent since we would have already validate it.
      parent: yup.mixed().optional(),
      children: yup.array(
        yup.lazy((val) => {
          if (val != null) {
            return schema.default(undefined);
          } else {
            return yup.mixed().optional();
          }
        })
      ),
    })
    .defined();

  return schema;
}

// Will recursively search for a notebook
export function getNotebookById(notebooks: Notebook[], id: string): Notebook {
  if (notebooks != null) {
    for (let i = 0; i < notebooks.length; i++) {
      if (notebooks[i].id === id) {
        return notebooks[i];
      } else if (notebooks[i].children?.length) {
        const r = getNotebookById(notebooks[i].children!, id);

        if (r != null) {
          return r;
        }
      }
    }
  }

  throw new NotFoundError(`No notebook with ${id} found`);
}

export function addChild(parent: Notebook, child: Notebook) {
  parent.children ??= [];
  parent.children.push(child);
  child.parent = parent;
}

export function removeChild(parent: Notebook, child: Notebook) {
  if (parent.children == null) {
    return;
  }

  const index = parent.children.findIndex((c) => c.id === child.id);
  if (index === -1) {
    throw new NotFoundError(`No notebook child with id ${child.id}`);
  }

  parent.children.splice(index, 1);
  delete child.parent;
}
