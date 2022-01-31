import { NotFoundError } from "../errors";
import { Entity } from "./types";

export interface Notebook extends Entity<"notebook"> {
  name: string;
  expanded?: boolean;
  parent?: Notebook;
  children?: Notebook[];
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
