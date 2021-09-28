import { NotebookGetters } from "@/store/modules/notebooks/getters";
import { NotebookMutations } from "@/store/modules/notebooks/mutations";
import { Actions } from "vuex-smart-module";
import { Notebook, NotebookState } from "./state";

export class NotebookActions extends Actions<
  NotebookState,
  NotebookGetters,
  NotebookMutations,
  NotebookActions
> {
  setExpanded({
    notebook,
    expanded,
    bubbleUp
  }: {
    notebook: Notebook;
    expanded: boolean;
    bubbleUp: boolean;
  }): void {
    this.commit("SET_EXPANDED", {
      notebook,
      expanded,
      bubbleUp
    });
  }
}
