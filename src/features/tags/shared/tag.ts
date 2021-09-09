import { Entity } from '@/store';

export interface Tag extends Entity {
    name: string;
}

export const TAG_NAME_MAX_LENGTH = 64;
