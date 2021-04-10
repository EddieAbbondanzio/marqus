import { Notebook } from '@/store/modules/notebooks/state';
import { Tag } from '@/store/modules/tags/state';

export interface GlobalNavigationNotebookSection {
    expanded: boolean;
    input: Partial<Notebook> & { mode?: 'create' | 'update'; parentId?: string };
    dragging?: Notebook;
    entries: Notebook[];
}

export interface GlobalNavigationTagSection {
    expanded: boolean;
    input: Partial<Tag> & { mode?: 'create' | 'update' };
    entries: Tag[];
}

export interface GlobalNavigation {
    width: string;
    notebooks: GlobalNavigationNotebookSection;
    tags: GlobalNavigationTagSection;
    /**
     * Id of the active tag, or notebook, or name of the active option
     */
    active?: string;
}

export const state: GlobalNavigation = {
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
};
