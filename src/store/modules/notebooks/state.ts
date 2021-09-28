import { Base } from "@/store/base";
import { idSchema } from "@/utils/id";
import { isBlank } from "@/utils/string";
import * as yup from "yup";

export interface Notebook extends Base {
  name: string;
  parent?: Notebook;
  children?: Notebook[];
  expanded?: boolean;
}

export const notebookNameSchema = yup
  .string()
  .required()
  .test(v => !isBlank(v))
  .min(1)
  .max(64);

export const notebookSchema: yup.SchemaOf<Notebook> = yup
  .object()
  .shape({
    id: idSchema,
    name: notebookNameSchema,
    parent: yup.object().optional(),
    children: yup
      .array()
      .optional()
      .default([]),
    expanded: yup
      .boolean()
      .optional()
      .default(false)
  })
  .defined();

/**
 * Recursively iterate notebooks and rebuilt their .parent references.
 * @param notebook The notebook to start at
 */
export function fixNotebookParentReferences(notebook: Notebook) {
  // Base case
  if (notebook.children == null || notebook.children.length === 0) {
    return;
  }

  // Recursive step
  for (let i = 0; i < notebook.children.length; i++) {
    const child = notebook.children[i];
    child.parent = notebook;

    fixNotebookParentReferences(child);
  }
}

export function killNotebookParentReferences(notebook: Notebook) {
  // Base case
  if (notebook.children == null || notebook.children.length === 0) {
    return;
  }

  // Recursive step
  for (let i = 0; i < notebook.children.length; i++) {
    const child = notebook.children[i];
    delete child.parent;

    killNotebookParentReferences(child);
  }
}

export function fullyQualify(notebook: Notebook): string {
  const arr = [];
  let n: Notebook | undefined = notebook;

  while (n != null) {
    arr.unshift(n.name);
    n = n.parent;
  }

  return arr.join("/");
}

export class NotebookState {
  values: Notebook[] = [];
}
