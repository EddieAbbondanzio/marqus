import { Tag } from '@/features/tags/common/tag';

export interface TagState {
    values: Tag[];
}

export const state: TagState = {
    values: []
};
