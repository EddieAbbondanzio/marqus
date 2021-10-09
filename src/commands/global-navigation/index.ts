import { MoveSelectionDown, MoveSelectionUp } from "../command-console";
import { CollapseAll } from "./collapse-all";
import { CreateNotebook } from "./create-notebook";
import { CreateTag } from "./create-tag";
import { DeleteAllNotebooks } from "./delete-all-notebooks";
import { DeleteAllTags } from "./delete-all-tags";
import { DeleteNotebook } from "./delete-notebook";
import { DeleteTag } from "./delete-tag";
import { EmptyTrash } from "./empty-trash";
import { ExpandAll } from "./expand-all";
import { Focus } from "./focus";
import { RenameNotebook } from "./rename-notebook";
import { RenameTag } from "./rename-tag";
import { ScrolDown } from "./scroll-down";
import { ScrolUp } from "./scroll-up";

export * from "./collapse-all";
export * from "./create-tag";
export * from "./delete-tag";
export * from "./expand-all";
export * from "./focus";
export * from "./move-selection-down";
export * from "./move-selection-up";
export * from "./rename-tag";
export * from "./scroll-down";
export * from "./scroll-up";
export * from "./rename-notebook";
export * from "./create-notebook";
export * from "./delete-notebook";
export * from "./delete-all-notebooks";
export * from "./delete-all-tags";
export * from "./empty-trash";

export const GLOBAL_NAVIGATION_REGISTRY = {
  focus: Focus,
  expandAll: ExpandAll,
  collapseAll: CollapseAll,
  createTag: CreateTag,
  renameTag: RenameTag,
  deleteTag: DeleteTag,
  deleteAllTags: DeleteAllTags,
  createNotebook: CreateNotebook,
  renameNotebook: RenameNotebook,
  deleteNotebook: DeleteNotebook,
  deleteAllNotebooks: DeleteAllNotebooks,
  moveSelectionUp: MoveSelectionUp,
  moveSelectionDown: MoveSelectionDown,
  scrollUp: ScrolUp,
  scrollDown: ScrolDown,
  emptyTrash: EmptyTrash

};
