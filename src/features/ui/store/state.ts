import { Editor } from '@/features/ui/store/modules/editor/state';
import { GlobalNavigationState } from '@/features/ui/store/modules/global-navigation/state';
import { LocalNavigation } from '@/features/ui/store/modules/local-navigation/state';

interface Cursor {
    icon: string;
    title?: string;
    dragging?: boolean;
}

export interface UserInterface {
    cursor: Cursor;
    globalNavigation: GlobalNavigationState;
    localNavigation: LocalNavigation;
    editor: Editor;
}

export const state: UserInterface = {
    cursor: {
        icon: 'pointer'
    }
} as any;
