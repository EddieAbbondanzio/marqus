import { Entity } from '@/core/store/entity';

export type TabState = 'preview' | 'normal' | 'dirty';

export interface Tab extends Entity {
    noteId: string;
    state: TabState;
    content: string;
    tagDropdownActive?: boolean;
    notebookDropdownActive?: boolean;
}

export type EditorMode = 'readonly' | 'edit' | 'split';

export interface Editor {
    tabs: {
        active?: string;
        dragging?: Tab;
        values: Tab[];
    };
    mode: EditorMode;
    isFocus?: boolean;
}

export const state: Editor = {
    tabs: {
        values: []
    },
    mode: 'readonly'
};
