import { globalId } from "../utils";
import { Note, Notebook, Tag } from "./entities";
import { ExplorerView, ExplorerItem } from "./state";

// Move this to a better spot later
export function getExplorerItems(
  view: ExplorerView,
  notes: Note[],
  notebooks: Notebook[],
  tags: Tag[]
): [ExplorerItem[], string[]] {
  let items: ExplorerItem[] = [];
  let selectables: string[] = [];

  switch (view) {
    case "all":
      notes.forEach((n) => {
        const id = globalId("note", n.id);
        items.push({
          globalId: id,
          text: n.name,
        });
        selectables.push(id);
      });
      break;

    case "tags":
      tags.forEach((t) => {
        const id = globalId("tag", t.id);
        const children = getNotesForTag(notes, t.id).map((n) => ({
          globalId: globalId("note", n.id),
          text: n.name,
        }));

        items.push({
          globalId: id,
          text: t.name,
          children,
        });
        selectables.push(id, ...children.map((c) => c.globalId));
      });
      break;

    case "notebooks":
      const recursisve = (n: Notebook) => {
        const id = globalId("notebook", n.id);
        const item: ExplorerItem = {
          globalId: id,
          text: n.name,
        };
        items.push(item);
        selectables.push(id);

        let children;
        if (n.children != null && n.children.length > 0) {
          n.children.forEach(recursisve);
          item.children = children;
        }
      };
      notebooks.forEach(recursisve);
      break;
  }

  return [items, selectables];
}

export function getNotesForTag(notes: Note[], tagId: string) {
  return notes.filter((n) => n.tags?.some((t) => t === tagId));
}
