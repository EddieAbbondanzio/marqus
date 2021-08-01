import { Entity } from '@/store';

export interface Tag extends Entity {
    value: string;
}

export const TAG_NAME_MAX_LENGTH = 64;
