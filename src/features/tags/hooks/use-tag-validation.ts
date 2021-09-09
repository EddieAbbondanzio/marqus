import { Tag, TAG_NAME_MAX_LENGTH } from '@/features/tags/shared/tag';
import { store } from '@/store';

export function useTagValidation(tag?: () => Partial<Tag> | undefined) {
    const getTags = () => store.state.tags.values as Tag[];
    const getIdentifier = (t: Tag) => t?.id;
    const getUniqueProperty = (t: Tag) => (t?.name ?? '').toLowerCase();

    return {
        required: true,
        max: TAG_NAME_MAX_LENGTH,
        unique: [getTags, getIdentifier, getUniqueProperty, tag]
    };
}
