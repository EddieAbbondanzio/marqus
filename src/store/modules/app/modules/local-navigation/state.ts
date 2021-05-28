import { EventBase } from '@/store/core/event-base';
import { EventHistory } from '@/store/core/event-history';
import { Note } from '@/store/modules/notes/state';

export type LocalNavigationEvent =
    | {
          type: 'widthUpdated';
          newValue: string;
          oldValue: string;
      }
    | {
          type: 'noteInputUpdated';
          newValue?: string;
          oldValue?: string;
      }
    | {
          type: 'noteInputStarted';
          note?: Note;
          active?: { id: string; type: 'notebook' | 'tag' };
      }
    | {
          type: 'noteInputCleared';
          oldValue?: string;
      }
    | {
          type: 'activeChanged';
          newValue?: string;
          oldValue?: string;
      };

export interface LocalNavigation {
    history: EventHistory<LocalNavigationEvent>;
    width: string;
    notes: {
        input: Partial<Note> & { mode?: 'create' | 'update' };
    };
    active?: string;
}

export const state: LocalNavigation = {
    history: new EventHistory(),
    width: '200px',
    notes: {
        input: {}
    }
};
