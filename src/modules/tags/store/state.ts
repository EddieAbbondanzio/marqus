import { Entity } from '@/core/store/entity';
import { Tag } from '@/modules/tags/common/tag';

export interface TagState {
    values: Tag[];
}

export const state: TagState = {
    values: []
};
