import { Entity } from '@/store';

export interface Note extends Entity {
    name: string;
    notebooks: string[];
    tags: string[];
    dateCreated: Date;
    dateModified: Date;
    trashed?: boolean;
    favorited?: boolean;
}
