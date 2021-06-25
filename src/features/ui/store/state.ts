import { Editor } from '@/features/app/store/modules/editor/state';
import { GlobalNavigation } from '@/features/app/store/modules/global-navigation/state';
import { LocalNavigation } from '@/features/app/store/modules/local-navigation/state';

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
