import { Entity } from '@/core/store/entity';

export type EditorEvent =
    | {
          type: 'activeUpdated';
          newValue?: string;
          oldValue?: string;
      }
    | {
          type: 'tabContentUpdated';
          newValue: string;
          oldValue: string;
          oldState: TabState;
      }
    | {
          type: 'tabStateUpdated';
          newValue: TabState;
          oldValue: TabState;
      }
    | {
          type: 'tabOpened';
          noteId: string;
          content: string;
          preview: boolean;
      }
    | {
          type: 'tabClosed';
          id: string;
      }
    | {
          type: 'tabsCloseAll';
      }
    | {
          type: 'tabDraggingUpdated';
          newValue?: string;
          oldValue?: string;
      }
    | {
          type: 'tabDraggingIndexUpdated';
          newValue: number;
          oldValue: number;
      }
    | {
          type: 'tagDropdownActiveUpdated';
          newValue: boolean;
          oldValue: boolean;
      }
    | {
          type: 'notebookDropdownActiveUpdated';
          newValue: boolean;
          oldValue: boolean;
      }
    | {
          type: 'editorModeUpdated';
          newValue: EditorMode;
          oldValue: EditorMode;
      };

export type TabState = 'preview' | 'normal' | 'dirty';

export interface Tab extends Entity {
    noteId: string;
    state: TabState;
    content: string;
    tagDropdownActive?: boolean;
    notebookDropdownActive?: boolean;
}

export type EditorMode = 'readonly' | 'edit' | 'split';

export interface Editor {
    tabs: {
        active?: string;
        dragging?: Tab;
        values: Tab[];
    };
    mode: EditorMode;
    isFocus?: boolean;
}

export const state: Editor = {
    tabs: {
        values: []
    },
    mode: 'readonly'
};
