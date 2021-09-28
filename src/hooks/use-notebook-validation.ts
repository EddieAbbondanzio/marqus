import { store } from "@/store";
import { Notebook } from "@/store/modules/notebooks/state";

export type PartialNotebook = { id?: string; value: string };

export function useNotebookValidation(
  notebook?: () => PartialNotebook | undefined
) {
  const getTags = () => store.state.notebooks.values as Notebook[];

  return {
    required: true,
    max: 64,
    unique: [
      getTags,
      (t: Notebook) => t?.id,
      (t: Notebook) => (t?.name ?? "").toLowerCase(),
      notebook
    ]
  };
}
