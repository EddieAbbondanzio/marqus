import { createContextMenuHook } from "@/hooks/create-context-menu-hook";
import { store } from "@/store";
import { Note } from "@/store/modules/notes/state";
import { climbDomUntil } from "@/utils/dom/climb-dom-until";

export const useLocalNavigationContextMenu = createContextMenuHook(
  "localNavigation",
  (_, p) => {
    const element = document.elementFromPoint(p.x, p.y) as HTMLElement;

    const id = climbDomUntil<string>(element, {
      match: el => el.hasAttribute("data-id"),
      matchValue: el => el.getAttribute("data-id")
    });

    // we can inject menu items as needed. This is called each time we right click
    const items = [] as any[];

    if (store.state.ui.globalNavigation.active !== "trash") {
      items.push({
        label: "Create Note",
        click: () => store.dispatch("ui/localNavigation/noteInputStart")
      });
    }

    if (id != null) {
      const note = store.state.notes.values.find(
        (n: Note) => n.id === id
      ) as Note;

      if (!note.trashed) {
        items.push({
          label: "Rename Note",
          click: () =>
            store.dispatch("ui/localNavigation/noteInputStart", { id })
        });
      } else {
        items.push({
          label: "Restore From Trash",
          click: () => store.commit("notes/RESTORE_FROM_TRASH", id)
        });
      }

      items.push({
        label: "Delete Note",
        click: () => store.dispatch("ui/localNavigation/noteDelete", id)
      });

      if (!note.favorited) {
        items.push({
          label: "Favorite",
          click: () => store.commit("notes/FAVORITE", id)
        });
      } else {
        items.push({
          label: "Unfavorite",
          click: () => store.commit("notes/UNFAVORITE", id)
        });
      }
    }

    return items;
  }
);
