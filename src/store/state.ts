import { AppState } from './modules/app/state';
import { NotebookState } from './modules/notebooks/state';
import { NoteState } from './modules/notes/state';
import { TagState } from './modules/tags/state';

export const DATA_DIRECTORY = 'data';

export interface State {
    app: AppState;
    tags: TagState;
    notebooks: NotebookState;
    notes: NoteState;
    dirty?: boolean;
}

export const state = {};
