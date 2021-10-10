import { Base } from "@/store/base";

export interface Note extends Base {
  name: string;
  notebooks?: string[];
  tags?: string[];
  /**
   * Was this note moved to the trash bin?
   */
  trashed?: boolean;
  /**
   * If the user starred the note.
   */
  favorited?: boolean;
  /**
   * If the note has been modified in some way since the last
   * time it was saved to the file system.
   */
  hasUnsavedChanges?: boolean;
}

export class NoteState {
  values: Note[] = [];
}
