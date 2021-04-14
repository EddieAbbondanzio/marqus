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
        input: {}
    },
    tags: {
        expanded: false,
        input: {}
    },
    width: '300px'
};
