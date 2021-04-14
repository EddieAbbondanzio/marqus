export interface Notebook {
    id: string;
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
