import { Notebook } from '@/features/notebooks/common/notebook';

/**
 * Search through a group of notebooks, and their children in an attempt
 * to find a notebook via it's id.
 * @param notebooks Collection of notebooks to look in.
 * @param id The id to look for.
 * @returns The matching notebook (if any)
 */
export function findNotebookRecursive(notebooks: Notebook[], id: string): Notebook | undefined {
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
