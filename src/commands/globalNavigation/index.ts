import { CollapseAll } from "./collapseAll";
import { CreateNotebook } from "./createNotebook";
import { CreateTag } from "./createTag";
import { DeleteAllNotebooks } from "./deleteAllNotebooks";
import { DeleteAllTags } from "./deleteAllTags";
import { DeleteNotebook } from "./deleteNotebook";
import { DeleteTag } from "./deleteTag";
import { EmptyTrash } from "./emptyTrash";
import { ExpandAll } from "./expandAll";
import { Focus } from "./focus";
import { MoveSelectionDown } from "./moveSelectionDown";
import { MoveSelectionUp } from "./moveSelectionUp";
import { RenameNotebook } from "./renameNotebook";
import { RenameTag } from "./renameTag";
import { ScrolDown } from "./scrollDown";
import { ScrolUp } from "./scrollUp";

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
