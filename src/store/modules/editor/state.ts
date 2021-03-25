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

interface GlobalNavigationNotebook {
    id: string;
    value: string;
    expanded: boolean;
    children: GlobalNavigationNotebook[] | null;
}

interface GlobalNavigationNotebookSection {
    expanded: boolean;
    create: Partial<Notebook> | null;
    entries: GlobalNavigationNotebook[];
}

interface GlobalNavigationTag {
    id: string;
    value: string;
}

interface GlobalNavigationTagSection {
    expanded: boolean;
    create: Partial<Tag> | null;
    entries: GlobalNavigationTag[];
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
            create: null
        },
        tags: {
            expanded: false,
            entries: [],
            create: null
        },
        width: '300px'
    },
    localNavigation: {
        width: '300px'
    }
};
