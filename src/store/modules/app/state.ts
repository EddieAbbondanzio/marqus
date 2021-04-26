import { Notebook } from '../notebooks/state';
import { Tag } from '../tags/state';
import { GlobalNavigation } from './modules/global-navigation/state';
import { LocalNavigation } from './modules/local-navigation/state';

interface Cursor {
    icon: string;
    title?: string;
}

export interface AppState {
    cursor: Cursor;
    globalNavigation: GlobalNavigation;
    localNavigation: LocalNavigation;
}

export const state: AppState = {
    cursor: {
        icon: 'pointer'
    }
} as any;
