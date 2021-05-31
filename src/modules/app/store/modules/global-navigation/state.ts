import { EventHistory } from '@/core/store/event-history';
import { Notebook } from '@/modules/notebooks/common/notebook';
import { Tag } from '@/modules/tags/common/tag';

export type GlobalNavigationEvent =
    | {
          type: 'activeChanged';
          newValue?: GlobalNavigationActive;
          oldValue?: GlobalNavigationActive;
      }
    | {
          type: 'widthUpdated';
          newValue: string;
          oldValue: string;
      }
    | {
          type: 'tagsExpanded';
          newValue: boolean;
          oldValue: boolean;
      }
    | {
          type: 'tagInputUpdated';
          newValue: string;
          oldValue: string;
      }
    | {
          type: 'tagInputStarted';
          tag?: Tag;
      }
    | {
          type: 'tagInputCleared';
          oldValue: GlobalNavigationTagInput;
      }
    | {
          type: 'notebooksExpanded';
          newValue: boolean;
          oldValue: boolean;
      }
    | {
          type: 'notebookInputUpdated';
          newValue: string;
          oldValue: string;
      }
    | {
          type: 'notebookInputCleared';
          oldValue: GlobalNavigationNotebookInput;
      }
    | {
          type: 'notebookInputStarted';
          notebook?: Notebook;
          parent?: Notebook;
      }
    | {
          type: 'notebookDraggingUpdated';
          newValue?: Notebook;
          oldValue?: Notebook;
      };

export type GlobalNavigationEventType = GlobalNavigationEvent['type'];

export type GlobalNavigationNotebookInput = Partial<Notebook> & { mode?: 'create' | 'update' };

export interface GlobalNavigationNotebookSection {
    expanded: boolean;
    input: GlobalNavigationNotebookInput;
    dragging?: Notebook;
}

export type GlobalNavigationTagInput = Partial<Tag> & { mode?: 'create' | 'update' };

export interface GlobalNavigationTagSection {
    expanded: boolean;
    input: GlobalNavigationTagInput;
}

export type GlobalNavigationActive = 'all' | 'favorites' | 'trash' | { id: string; type: 'notebook' | 'tag' };

export interface GlobalNavigation {
    history: EventHistory<GlobalNavigationEvent>;
    width: string;
    notebooks: GlobalNavigationNotebookSection;
    tags: GlobalNavigationTagSection;
    active?: GlobalNavigationActive;
}

export const state: GlobalNavigation = {
    history: new EventHistory(),
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
