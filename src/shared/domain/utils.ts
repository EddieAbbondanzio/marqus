import { customAlphabet } from "nanoid";
import { EntityType, Note, Notebook, Tag } from "./entities";
import { ExplorerView, ExplorerItem } from "./state";

export const ID_LENGTH = 10;
export const ID_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Do not rename to id() unless you never want to use const id = id()
export const uuid = customAlphabet(ID_ALPHABET, ID_LENGTH);

/**
 * Check if a string matches the uuid format being used.
 * @param id The id to test.
 * @returns True if the string is a v4 uuid.
 */
export function isId(id: string): boolean {
  return /^[a-zA-Z\d]{10}$/.test(id);
}

export function globalId(type: EntityType, id: string) {
  return `${type}.${id}`;
}

export function parseGlobalId(globalId: string): [EntityType, string] {
  if (!/^(tag|notebook|note).[a-zA-Z0-9]{10}$/.test(globalId)) {
    throw Error(`Invalid global id ${globalId}`);
  }

  const split = globalId.split(".") as [EntityType, string];
  return split;
}

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
