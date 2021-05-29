import { Entity } from '@/core/store/entity';
import { Note } from '@/modules/notes/common/note';

export interface NoteState {
    values: Note[];
}

export const state: NoteState = {
    values: []
};
