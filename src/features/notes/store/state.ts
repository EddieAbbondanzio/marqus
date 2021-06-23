import { Note } from '@/features/notes/common/note';

export interface NoteState {
    values: Note[];
}

export const state: NoteState = {
    values: []
};
