import { AppState } from './modules/app/state';
import { NotebookState } from './modules/notebooks/state';
import { NoteState } from './modules/notes/state';
import { TagState } from './modules/tags/state';

export interface State {
    app: AppState;
    tags: TagState;
    notebooks: NotebookState;
    notes: NoteState;
}

export const state = {};
