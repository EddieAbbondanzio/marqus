import { Getters } from "vuex-smart-module";
import { Note } from "../notes/state";
import { Notebook, NotebookState } from "./state";

export class NotebookGetters extends Getters<NotebookState> {
  get count() {
    return this.getters.flatten.length;
  }

  /**
   * Flatten the tree structure of all the notebooks into a 1d array.
   */
  get flatten() {
    const visited: { [i: string]: Notebook } = {};

    const recursiveStep = (toVisit: Notebook[]) => {
      for (const notebook of toVisit) {
        // Skip if we already visited it.
        if (visited[notebook.id] != null) {
          continue;
        }

        // Insert it
        visited[notebook.id] = notebook;

        // Does it have children to visit?
        if (notebook.children != null) {
          recursiveStep(notebook.children);
        }
      }
    };

    recursiveStep(this.state.values);
    return Object.values(visited);
  }

  get flattenVisible() {
    const visited: { [i: string]: Notebook } = {};

    const recursiveStep = (toVisit: Notebook[]) => {
      for (const notebook of toVisit) {
        // Skip if we already visited it.
        if (visited[notebook.id] != null) {
          continue;
        }

        // Insert it
        visited[notebook.id] = notebook;

        // Does it have children to visit?
        if (notebook.children != null && notebook.expanded) {
          recursiveStep(notebook.children);
        }
      }
    };

    recursiveStep(this.state.values);
    return Object.values(visited);
  }

  first() {
    return this.state.values[0];
  }

  last() {
    const visible = this.getters.flattenVisible;

    if (visible.length === 0) {
      return null;
    }

    return visible[visible.length - 1];
  }

  getNext(id: string) {
    const visible = this.getters.flattenVisible;
    const index = visible.findIndex((n) => n.id === id);

    if (index >= visible.length - 1) {
      return null;
    }

    return visible[index + 1];
  }

  getPrevious(id: string) {
    const visible = this.getters.flattenVisible;
    const index = visible.findIndex((n) => n.id === id);

    if (index <= 0) {
      return null;
    }

    return visible[index - 1];
  }

  notebooksForNote(note: Note) {
    if (note == null) {
      return [];
    }

    const notebooks = this.getters.flatten;
    const res = notebooks.filter(
      (n: any) =>
        note.notebooks != null &&
        note.notebooks.some((notebookId: string) => notebookId === n.id)
    );
    return res;
  }

  byId(id: string): Notebook | undefined;
  byId(id: string, opts: { required?: true; notebooks?: Notebook[] }): Notebook;
  byId(
    id: string,
    opts: { required?: boolean; notebooks?: Notebook[] } = {}
  ): Notebook | undefined {
    const notebook = findNotebookRecursive(
      opts.notebooks ?? this.state.values,
      id
    );

    if (opts.required && notebook == null) {
      throw Error(`No notebook with id ${id} found.`);
    }

    return notebook;
  }
}

/**
 * Search through a group of notebooks, and their children in an attempt
 * to find a notebook via it's id.
 * @param notebooks Collection of notebooks to look in.
 * @param id The id to look for.
 * @returns The matching notebook (if any)
 */
function findNotebookRecursive(
  notebooks: Notebook[],
  id: string
): Notebook | undefined {
  if (notebooks == null) {
    return undefined;
  }

  for (let i = 0; i < notebooks.length; i++) {
    if (notebooks[i].id === id) {
      return notebooks[i];
    } else if (notebooks[i].children?.length) {
      const r = findNotebookRecursive(notebooks[i].children!, id);

      if (r != null) {
        return r;
      }
    }
  }
}
