export interface Note {
    id: string;
    name: string;
    notebooks: string[];
    tags: string[];
    dateCreated: Date;
    dateModified: Date;
    trashed?: boolean;
    favorited?: boolean;
}

export interface NoteState {
    values: Note[];
}

export const state: NoteState = {
    values: []
};
