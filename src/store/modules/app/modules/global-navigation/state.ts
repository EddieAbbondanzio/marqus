import { Notebook } from '@/store/modules/notebooks/state';
import { Tag } from '@/store/modules/tags/state';

export interface GlobalNavigationNotebookSection {
    expanded: boolean;
    input: Partial<Notebook> & { mode?: 'create' | 'update' };
    dragging?: Notebook;
}

export interface GlobalNavigationTagSection {
    expanded: boolean;
    input: Partial<Tag> & { mode?: 'create' | 'update' };
}

export type GlobalNavigationActive = 'all' | 'favorites' | 'trash' | { id: string; type: 'notebook' | 'tag' };

export interface GlobalNavigation {
    width: string;
    notebooks: GlobalNavigationNotebookSection;
    tags: GlobalNavigationTagSection;
    active?: GlobalNavigationActive;
}

export const state: GlobalNavigation = {
    notebooks: {
        expanded: false,
        input: {}
    },
    tags: {
        expanded: false,
        input: {}
    },
    width: '300px'
};
