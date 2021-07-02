export interface GlobalNavigationNotebookInput {
    id?: string;
    value: string;
    parentId?: string;
    mode: 'create' | 'update';
}

export interface GlobalNavigationTagInput {
    id?: string;
    value: string;
    mode: 'create' | 'update';
}

export interface GlobalNavigationNotebookSection {
    expanded: boolean;
    input?: GlobalNavigationNotebookInput;
    dragging?: string;
}

export interface GlobalNavigationTagSection {
    expanded: boolean;
    input?: GlobalNavigationTagInput;
}

export type GlobalNavigationActive =
    | { section: 'all' | 'favorites' | 'trash' }
    | { section: 'notebook' | 'tag'; id: string };

export interface GlobalNavigation {
    width: string;
    notebooks: GlobalNavigationNotebookSection;
    tags: GlobalNavigationTagSection;
    active: GlobalNavigationActive;
}

export const state: GlobalNavigation = {
    active: {
        section: 'all'
    },
    notebooks: {
        expanded: false
    },
    tags: {
        expanded: false
    },
    width: '300px'
};
