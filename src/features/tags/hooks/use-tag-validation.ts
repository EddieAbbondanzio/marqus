import { Tag } from '@/features/tags/common/tag';
import { store } from '@/store';

export type PartialTag = { id?: string; value: string };

export function useTagValidation(tag?: () => PartialTag | undefined) {
    const getTags = () => store.state.tags.values as Tag[];

    return {
        required: true,
        max: 64,
        unique: [getTags, (t: Tag) => t?.id, (t: Tag) => t?.value?.toLowerCase(), tag]
    };
}
