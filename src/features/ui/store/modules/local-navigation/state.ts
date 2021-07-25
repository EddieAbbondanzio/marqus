export type LocalNavigationNoteInput =
    | {
          mode: 'create';
          id: string;
          name: string;
          notebooks?: string[];
          tags?: string[];
      }
    | {
          mode: 'update';
          id: string;
          name: string;
      };

export class LocalNavigationState {
    width: string = '200px';
    notes: {
        input?: LocalNavigationNoteInput;
    } = {};
    active?: string;
}
