import { NotFoundError } from "../errors";
import { Entity } from "./types";
import * as yup from "yup";

export interface Notebook extends Entity<"notebook"> {
  name: string;
  expanded?: boolean;
  parent?: Notebook;
  children?: Notebook[];
}

export const notebookSchema: yup.SchemaOf<Notebook> = yup
  .object()
  .shape({} as any);

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
