export interface Notebook {
    id: string;
    value: string;
    expanded: boolean;
    parent?: Notebook;
    children?: Notebook[];
}

export interface Tag {
    id: string;
    value: string;
}

interface GlobalNavigationNotebookSection {
    expanded: boolean;
    input: Partial<Notebook> & { mode?: 'create' | 'update'; parentId?: string };
    dragging?: Notebook;
    entries: Notebook[];
}

interface GlobalNavigationTagSection {
    expanded: boolean;
    input: Partial<Tag> & { mode?: 'create' | 'update' };
    entries: Tag[];
}

interface GlobalNavigation {
    width: string;
    notebooks: GlobalNavigationNotebookSection;
    tags: GlobalNavigationTagSection;
    /**
     * Id of the active tag, or notebook, or name of the active option
     */
    active?: string;
}

interface LocalNavigation {
    width: string;
}

interface Cursor {
    icon: string;
    title?: string;
}

export interface AppState {
    mode: 'edit' | 'view';
    activeFile: string | null;
    globalNavigation: GlobalNavigation;
    localNavigation: LocalNavigation;
    cursor: Cursor;
}

export const state: AppState = {
    mode: 'view',
    activeFile: null,
    globalNavigation: {
        notebooks: {
            expanded: false,
            entries: [],
            input: { mode: null! }
        },
        tags: {
            expanded: false,
            entries: [],
            input: { mode: null! }
        },
        width: '300px'
    },
    localNavigation: {
        width: '300px'
    },
    cursor: {
        icon: 'pointer'
    }
};
