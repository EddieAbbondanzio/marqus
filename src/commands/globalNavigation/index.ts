import { MoveSelectionDown, MoveSelectionUp } from "../commandConsole";
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
  emptyTrash: EmptyTrash,
};
