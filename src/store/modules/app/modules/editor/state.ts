export interface Tab {
    id: string;
    noteId: string;
    state: 'preview' | 'normal' | 'dirty';
    content: string;
}

export interface Editor {
    tabs: {
        active?: string;
        dragging?: Tab;
        values: Tab[];
    };
}

export const state: Editor = {
    tabs: {
        values: []
    }
};
