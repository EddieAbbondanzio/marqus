import { CONTEXT_MENU_ATTRIBUTE } from "@/directives/context-menu";
import { climbDomForMatch } from "@/utils/dom";
import contextMenu from "electron-context-menu";
import { onBeforeUnmount, onMounted } from "vue";

/**
 * Factory method to streamline creating location based context menus.
 * @param name The unique name of the context menu. Used with v-context-menu directive
 * @param menu The menu items to display
 * @returns The hook that can be called in setup().
 */
export function createContextMenuHook(
  name: string,
  menu: contextMenu.Options["menu"]
) {
  return () => {
    let release: () => void;

    onMounted(() => {
      release = contextMenu({
        menu,
        shouldShowMenu: (e, p) => {
          const element = document.elementFromPoint(p.x, p.y) as HTMLElement;

          const menuName = climbDomForMatch(element, el => el.hasAttribute(CONTEXT_MENU_ATTRIBUTE),
            { matchValue: el => el.getAttribute(CONTEXT_MENU_ATTRIBUTE) });

          return menuName === name;
        }
      });
    });

    onBeforeUnmount(() => {
      release();
    });
  };
}
