import { createContextMenuHook } from "@/hooks/create-context-menu-hook";
import { store } from "@/store";
import { climbDomForMatch } from "@/utils/dom";

export const useGlobalNavigationContextMenu = createContextMenuHook(
  "globalNavigation",
  (c, p) => {
    const element = document.elementFromPoint(p.x, p.y) as HTMLElement;
    const isElementNotebook = climbDomForMatch(element, el => el.classList.contains("global-navigation-notebook"));
    const isElementTag = climbDomForMatch(element, el => el.classList.contains("global-navigation-tag"));

    const id = climbDomForMatch(
      element,
      el => el.hasAttribute("data-id"),
      { matchValue: el => el.getAttribute("data-id") }
    );

    // we can inject menu items as needed. This is called each time we right click
    const items = [
      {
        label: "Expand All",
        click: () => store.dispatch("ui/globalNavigation/expandAll")
      },
      {
        label: "Collapse All",
        click: () => store.dispatch("ui/globalNavigation/collapseAll")
      },
      {
        type: "separator" as any
      },
      {
        label: "Create Notebook",
        click: () => {
          if (isElementNotebook) {
            store.dispatch("ui/globalNavigation/notebookInputStart", {
              parentId: id
            });
          } else {
            store.dispatch("ui/globalNavigation/notebookInputStart");
          }
        }
      },
      {
        label: "Create Tag",
        click: () => store.dispatch("ui/globalNavigation/tagInputStart")
      }
    ];

    if (isElementNotebook) {
      items.push({
        label: "Rename Notebook",
        click: () =>
          store.dispatch("ui/globalNavigation/notebookInputStart", { id })
      });

      items.push({
        label: "Delete Notebook",
        click: () => store.dispatch("ui/globalNavigation/notebookDelete", id)
      });

      items.push({
        label: "Delete All Notebooks",
        click: () => store.dispatch("ui/globalNavigation/notebookDeleteAll")
      });
    }

    // if tag, offer option to delete
    if (isElementTag) {
      items.push({
        label: "Rename Tag",
        click: () => store.dispatch("ui/globalNavigation/tagInputStart", { id })
      });

      items.push({
        label: "Delete Tag",
        click: () => store.dispatch("ui/globalNavigation/tagDelete", id)
      });

      items.push({
        label: "Delete All Tags",
        click: () => store.dispatch("ui/globalNavigation/tagDeleteAll")
      });
    }

    items.push({
      label: "Empty Trash",
      click: () => store.dispatch("ui/globalNavigation/emptyTrash")
    });
    return items;
  }
);
