export interface Tag {
    id: string;
    value: string;
}

export interface TagState {
    values: Tag[];
}

export const state: TagState = {
    values: []
};
