import { ShortcutState } from '@/modules/shortcuts/store/state';
import { AppState } from '../modules/app/store/state';
import { NotebookState } from '../modules/notebooks/store/state';
import { NoteState } from '../modules/notes/store/state';
import { TagState } from '../modules/tags/store/state';

export interface State {
    app: AppState;
    tags: TagState;
    notebooks: NotebookState;
    notes: NoteState;
    shortcuts: ShortcutState;
}

export const state = {};
