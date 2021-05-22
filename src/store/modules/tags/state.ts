import { Entity } from '@/store/core/entity';

export interface Tag extends Entity {
    value: string;
}

export interface TagState {
    values: Tag[];
}

export const state: TagState = {
    values: []
};
