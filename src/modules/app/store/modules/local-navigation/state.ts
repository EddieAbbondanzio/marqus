import { EventBase } from '@/core/store/event-base';
import { EventHistory } from '@/core/store/event-history';
import { Note } from '@/modules/notes/common/note';

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
          oldValue: LocalNavigationNoteInput;
      }
    | {
          type: 'activeChanged';
          newValue?: string;
          oldValue?: string;
      };

export type LocalNavigationEventType = LocalNavigationEvent['type'];

export type LocalNavigationNoteInput = Partial<Note> & { mode?: 'create' | 'update' };

export interface LocalNavigation {
    history: EventHistory<LocalNavigationEvent>;
    width: string;
    notes: {
        input: LocalNavigationNoteInput;
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
