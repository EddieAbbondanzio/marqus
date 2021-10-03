import { createContextMenuHook } from "@/hooks/create-context-menu-hook";
import { store } from "@/store";
import { commands } from "@/commands";
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
        click: () => commands.run("globalNavigationExpandAll")
      },
      {
        label: "Collapse All",
        click: () => commands.run("globalNavigationCollapseAll")
      },
      {
        type: "separator" as any
      },
      {
        label: "Create Notebook",
        click: () => {
          if (isElementNotebook) {
            commands.run("globalNavigationCreateNotebook", {
              parentId: id
            });
          } else {
            commands.run("globalNavigationRenameNotebook");
          }
        }
      },
      {
        label: "Create Tag",
        click: () => commands.run("globalNavigationCreateTag")
      }
    ];

    if (isElementNotebook) {
      items.push({
        label: "Rename Notebook",
        click: () => commands.run("globalNavigationRenameTag", id)
      });

      items.push({
        label: "Delete Notebook",
        click: () => commands.run("globalNavigationDeleteNotebook", id)
      });

      items.push({
        label: "Delete All Notebooks",
        click: () => commands.run("globalNavigationDeleteAllNotebooks")
      });
    }

    // if tag, offer option to delete
    if (isElementTag) {
      items.push({
        label: "Rename Tag",
        click: () => commands.run("globalNavigationRenameTag", id)
      });

      items.push({
        label: "Delete Tag",
        click: () => commands.run("globalNavigationDeleteTag", id)
      });

      items.push({
        label: "Delete All Tags",
        click: () => commands.run("globalNavigationDeleteAllTags")
      });
    }

    items.push({
      label: "Empty Trash",
      click: () => commands.run("globalNavigationEmptyTrash")
    });
    return items;
  }
);
