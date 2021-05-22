import { Entity } from '@/store/core/entity';

export interface Note extends Entity {
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
