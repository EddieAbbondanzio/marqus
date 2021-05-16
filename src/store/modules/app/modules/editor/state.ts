export interface Tab {
    id: string;
    noteId: string;
    state: 'preview' | 'clean' | 'dirty';
    content: string;
}

export interface Editor {
    activeTab?: string;
    tabs: Tab[];
}

export const state: Editor = {
    tabs: []
};