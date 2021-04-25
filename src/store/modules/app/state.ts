import { Notebook } from '../notebooks/state';
import { Tag } from '../tags/state';

interface LocalNavigation {
    width: string;
}

interface Cursor {
    icon: string;
    title?: string;
}

export interface AppState {
    mode: 'edit' | 'view';
    activeFile: string | null;
    cursor: Cursor;
}

export const state: AppState = {
    mode: 'view',
    activeFile: null,
    cursor: {
        icon: 'pointer'
    }
};
