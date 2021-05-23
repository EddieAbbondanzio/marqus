import { Entity } from '@/store/core/entity';

export interface Tab extends Entity {
    noteId: string;
    state: 'preview' | 'normal' | 'dirty';
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
