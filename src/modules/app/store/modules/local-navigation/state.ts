export interface LocalNavigationNoteInput {
    mode?: 'create' | 'update';
    id?: string;
    name: string;
    notebooks?: string[];
    tags?: string[];
}

export interface LocalNavigation {
    width: string;
    notes: {
        input?: LocalNavigationNoteInput;
    };
    active?: string;
}

export const state: LocalNavigation = {
    width: '200px',
    notes: {}
};
