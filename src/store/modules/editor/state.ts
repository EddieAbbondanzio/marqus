export interface Notebook {
    id: string;
    value: string;
    expanded: boolean;
    children?: Notebook[];
}

export interface Tag {
    id: string;
    value: string;
}

interface GlobalNavigationNotebookSection {
    expanded: boolean;
    input: Partial<Notebook> & { mode?: 'create' | 'update'; parentId?: string };
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
}

interface LocalNavigation {
    width: string;
}

export interface EditorState {
    mode: 'edit' | 'view';
    activeFile: string | null;
    globalNavigation: GlobalNavigation;
    localNavigation: LocalNavigation;
}

export const state: EditorState = {
    mode: 'view',
    activeFile: null,
    globalNavigation: {
        notebooks: {
            expanded: false,
            entries: [],
            input: {}
        },
        tags: {
            expanded: false,
            entries: [],
            input: {}
        },
        width: '300px'
    },
    localNavigation: {
        width: '300px'
    }
};
