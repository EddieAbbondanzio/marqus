import { Notebook, NOTEBOOK_NAME_MAX_LENGTH } from '@/features/notebooks/shared/notebook';
import { store } from '@/store';

export type PartialNotebook = { id?: string; value: string };

export function useNotebookValidation(notebook?: () => PartialNotebook | undefined) {
    const getTags = () => store.state.notebooks.values as Notebook[];

    return {
        required: true,
        max: NOTEBOOK_NAME_MAX_LENGTH,
        unique: [getTags, (t: Notebook) => t?.id, (t: Notebook) => (t?.name ?? '').toLowerCase(), notebook]
    };
}
