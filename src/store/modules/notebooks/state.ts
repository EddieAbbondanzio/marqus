import { Entity } from '@/store/core/entity';

export interface Notebook extends Entity {
    value: string;
    parent?: Notebook;
    children?: Notebook[];
    expanded: boolean;
}

export interface NotebookState {
    values: Notebook[];
}

export const state: NotebookState = {
    values: []
};
