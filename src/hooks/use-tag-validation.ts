import { store } from "@/store";
import { Tag } from "@/store/modules/tags/state";

export function useTagValidation(tag?: () => Partial<Tag> | undefined) {
  const getTags = () => store.state.tags.values as Tag[];
  const getIdentifier = (t: Tag) => t?.id;
  const getUniqueProperty = (t: Tag) => (t?.name ?? "").toLowerCase();

  return {
    required: true,
    max: 64,
    unique: [getTags, getIdentifier, getUniqueProperty, tag]
  };
}
