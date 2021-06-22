import { EventHistory } from '@/core/store/plugins/undo/event-history';
import { Notebook } from '@/modules/notebooks/common/notebook';
import { Tag } from '@/modules/tags/common/tag';

/*
 * Don't pass notebooks around in events or else we risk creating circular dependencies
 * that cause the JSON serializer to go BOOM when saving to file.
 */

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
          tag?: { id: string; value: string };
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
          notebook?: { id: string; value: string };
          parentId?: string;
      }
    | {
          type: 'notebookDraggingUpdated';
          newValue?: string;
          oldValue?: string;
      };

export type GlobalNavigationEventType = GlobalNavigationEvent['type'];

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
        expanded: false
    },
    tags: {
        expanded: false
    },
    width: '300px'
};
