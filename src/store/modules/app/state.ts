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
    localNavigation: LocalNavigation;
    cursor: Cursor;
}

export const state: AppState = {
    mode: 'view',
    activeFile: null,
    localNavigation: {
        width: '300px'
    },
    cursor: {
        icon: 'pointer'
    }
};
