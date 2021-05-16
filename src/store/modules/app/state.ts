import { Editor } from '@/store/modules/app/modules/editor/state';
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
    editor: Editor;
}

export const state: AppState = {
    cursor: {
        icon: 'pointer'
    }
} as any;
