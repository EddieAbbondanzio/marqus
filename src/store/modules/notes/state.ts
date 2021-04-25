export interface Note {
    id: string;
    name: string;
    notebooks: string[];
    tags: string[];
    dateCreated: Date;
    dateModified: Date;
    content: string;
}

export interface NoteState {
    values: Note[];
}

export const state: NoteState = {
    values: []
};
