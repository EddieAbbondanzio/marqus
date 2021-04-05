export interface Notebook {
    id: string;
    value: string;
    parent: Notebook | null;
    children: Notebook[] | null;
    expanded: boolean;
}

export interface NotebookState {
    values: Notebook[];
}

export const state: NotebookState = {
    values: []
};
