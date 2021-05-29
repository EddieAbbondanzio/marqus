import { Editor } from '@/modules/editor/store/state';
import { LocalNavigation } from '@/modules/local-navigation/store/state';
import { GlobalNavigation } from '@/modules/global-navigation/store/state';

interface Cursor {
    icon: string;
    title?: string;
    dragging?: boolean;
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
