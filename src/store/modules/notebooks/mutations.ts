import {
  Notebook,
  NotebookState
} from "./state";
import { Mutations } from "vuex-smart-module";
import { caseInsensitiveCompare } from "@/utils/string";
import { notebookSchema, notebookNameSchema } from "@/validation";

export class NotebookMutations extends Mutations<NotebookState> {
  SET_STATE(s: NotebookState) {
    Object.assign(this.state, s);
  }

  CREATE(p: Partial<Notebook>) {
    const validated = notebookSchema.validateSync(p);

    const notebook = {
      ...validated,
      created: new Date(),
      hasUnsavedChanes: true
    };

    if (notebook.parent == null) {
      this.state.values.push(notebook);
    } else {
      // eslint-disable-next-line no-unused-expressions
      notebook.parent.children?.push(notebook);
    }
  }

  RENAME({ notebook, newName }: { notebook: Notebook; newName: string }) {
    notebookNameSchema.validateSync(newName);

    notebook.name = newName;
  }

  DELETE(notebook: Notebook) {
    const array =
      notebook.parent == null ? this.state.values : notebook.parent!.children!;
    const index = array.findIndex(n => n.id === notebook.id);

    if (index === -1) {
      throw new Error("No notebook found.");
    }

    array.splice(index, 1);

    // Remove option to expand / collapse notebook when no children.
    if (notebook.parent != null && notebook.parent.children!.length === 0) {
      delete notebook.parent.children;
      notebook.parent.expanded = false;
    }
  }

  DELETE_ALL() {
    this.state.values.length = 0;
  }

  SORT() {
    // Sort nested
    recursiveSort(this.state.values);

    function recursiveSort(notebooks: Notebook[]) {
      for (let i = 0; i < notebooks.length; i++) {
        const n = notebooks[i];

        if (n.children != null) {
          n.children.sort(caseInsensitiveCompare(v => v.name));
          recursiveSort(n.children);
        }
      }
    }

    // Sort root
    this.state.values.sort(caseInsensitiveCompare(v => v.name));
  }

  SET_EXPANDED({
    notebook,
    expanded,
    bubbleUp
  }: {
    notebook: Notebook;
    expanded: boolean;
    bubbleUp: boolean;
  }) {
    let n: Notebook | undefined = notebook;

    // Run up the tree expanding each parent until we hit the root
    do {
      n.expanded = expanded;
      n = n.parent;
    // eslint-disable-next-line no-unmodified-loop-condition
    } while (n != null && bubbleUp);
  }

  SET_ALL_EXPANDED({ expanded = false }) {
    for (let i = 0; i < this.state.values.length; i++) {
      recursiveStep(this.state.values[i], expanded);
    }

    function recursiveStep(n: Notebook, e: boolean) {
      n.expanded = e;

      if (n.children == null) {
        return;
      }

      for (let i = 0; i < n.children.length; i++) {
        recursiveStep(n.children[i], e);
      }
    }
  }
}
