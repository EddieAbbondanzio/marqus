export interface GlobalNavigationNotebookInput {
    id?: string;
    value: string;
    parentId?: string;
    mode: 'create' | 'update';
}

export type GlobalNavigationTagInput =
    | {
          mode: 'create';
          value: string;
      }
    | {
          mode: 'update';
          id: string;
          value: string;
      };

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

export class GlobalNavigationState {
    width = '300px';

    notebooks: GlobalNavigationNotebookSection = {
        expanded: false
    };

    tags: GlobalNavigationTagSection = {
        expanded: false
    };

    active: GlobalNavigationActive = {
        section: 'all'
    };
}
