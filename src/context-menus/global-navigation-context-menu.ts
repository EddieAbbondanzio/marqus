import { commands } from "@/commands";
import { createContextMenuHook, findParent } from "@/utils";

export const useGlobalNavigationContextMenu = createContextMenuHook(
  "globalNavigation",
  (c, p) => {
    const element = document.elementFromPoint(p.x, p.y) as HTMLElement;
    const isElementNotebook = findParent(element, el => el.classList.contains("global-navigation-notebook"));
    const isElementTag = findParent(element, el => el.classList.contains("global-navigation-tag"));

    const id = findParent(
      element,
      el => el.hasAttribute("data-id"),
      { matchValue: el => el.getAttribute("data-id") }
    );

    // we can inject menu items as needed. This is called each time we right click
    const items = [
      {
        label: "Expand All",
        click: () => commands.run("globalNavigation.expandAll")
      },
      {
        label: "Collapse All",
        click: () => commands.run("globalNavigation.collapseAll")
      },
      {
        type: "separator" as any
      },
      {
        label: "Create Notebook",
        click: () => {
          if (isElementNotebook) {
            commands.run("globalNavigation.createNotebook", {
              parentId: id!
            });
          } else {
            commands.run("globalNavigation.renameNotebook", id!);
          }
        }
      },
      {
        label: "Create Tag",
        click: () => commands.run("globalNavigation.createTag")
      }
    ];

    if (isElementNotebook) {
      items.push({
        label: "Rename Notebook",
        click: () => commands.run("globalNavigation.renameTag", id!)
      });

      items.push({
        label: "Delete Notebook",
        click: () => commands.run("globalNavigation.deleteNotebook", id!)
      });

      items.push({
        label: "Delete All Notebooks",
        click: () => commands.run("globalNavigation.deleteAllNotebooks")
      });
    }

    // if tag, offer option to delete
    if (isElementTag) {
      items.push({
        label: "Rename Tag",
        click: () => commands.run("globalNavigation.renameTag", id!)
      });

      items.push({
        label: "Delete Tag",
        click: () => commands.run("globalNavigation.deleteTag", id!)
      });

      items.push({
        label: "Delete All Tags",
        click: () => commands.run("globalNavigation.deleteAllTags")
      });
    }

    items.push({
      label: "Empty Trash",
      click: () => commands.run("globalNavigation.emptyTrash")
    });
    return items;
  }
);
