import { Entity } from '@/store';

export interface Note extends Entity {
    name: string;
    notebooks: string[];
    tags: string[];
    dateCreated: Date;
    dateModified?: Date;
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
