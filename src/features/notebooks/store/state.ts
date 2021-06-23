import { Notebook } from '@/features/notebooks/common/notebook';

export interface NotebookState {
    values: Notebook[];
}

export const state: NotebookState = {
    values: []
};
