import { Notebook } from '../notebooks/state';
import { Tag } from '../tags/state';
import { GlobalNavigation } from './modules/global-navigation/state';

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
    globalNavigation: GlobalNavigation;
    localNavigation: LocalNavigation;
}

export const state: AppState = {
    mode: 'view',
    activeFile: null,
    cursor: {
        icon: 'pointer'
    }
} as any;
