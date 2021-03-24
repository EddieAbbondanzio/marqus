export interface Notebook {
    id: string;
    value: string;
    expanded: boolean;
    children?: Notebook[];
}

export interface Tag {
    id: string;
    value: string;
    expanded: boolean;
}

export interface EditorState {
    mode: 'edit' | 'view';
    activeFile: string | null;
    'window.globalNavigation.width': string;
    'window.localNavigation.width': string;
    notebooks: Notebook[];
    tags: Tag[];
}

export const state: EditorState = {
    mode: 'view',
    activeFile: null,
    'window.globalNavigation.width': '300px',
    'window.localNavigation.width': '300px',
    notebooks: [],
    tags: []
};
