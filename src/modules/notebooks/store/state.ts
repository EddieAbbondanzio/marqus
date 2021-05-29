import { Entity } from '@/core/store/entity';

export interface NotebookState {
    values: Notebook[];
}

export const state: NotebookState = {
    values: []
};
