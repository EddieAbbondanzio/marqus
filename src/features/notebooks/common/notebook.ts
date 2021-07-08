import { Entity } from '@/store/common/types/entity';

export interface Notebook extends Entity {
    value: string;
    parent?: Notebook;
    children?: Notebook[];
    expanded?: boolean;
}

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
