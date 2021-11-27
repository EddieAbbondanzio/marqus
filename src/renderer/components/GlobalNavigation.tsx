import {
  faBook,
  faFile,
  faStar,
  faTag,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import React, { createRef, useMemo, useRef } from "react";
import { ContextMenu } from "../../shared/ui/contextMenu";
import { useAppContext } from "../App";
import { useContextMenu } from "../ui/contextMenu";
import { ContextMenu as ContextMenuComp } from "./shared/ContextMenu";
import { Focusable } from "./shared/Focusable";
import { NavigationMenu, NavigationMenuProps } from "./shared/NavigationMenu";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";

export function GlobalNavigation(): JSX.Element {
  const { state, execute } = useAppContext();

  /**
   * Generate the navigation menu components. This isn't something we want
   * to do unless things change so we memo it to save on performace costs
   */
  const menus = useMemo(() => {
    const all = {
      label: "all",
      icon: faFile,
      path: "all",
    };
    const notebooks = {
      label: "notebooks",
      icon: faBook,
      path: "notebooks",
    };
    const tags = {
      label: "tags",
      icon: faTag,
      path: "tags",
    };

    const favorites = {
      label: "favorites",
      icon: faStar,
      path: "favorites",
    };
    const trash = {
      label: "trash",
      icon: faTrash,
      path: "trash",
    };

    // TODO: Allow the user to reorder / hide these
    const items: Array<NavigationMenuProps & { path: string }> = [
      all,
      notebooks,
      tags,
      favorites,
      trash,
    ];

    // Recursively render the menus
    const mapper = (item: NavigationMenuProps & { path: string }) => (
      <NavigationMenu
        key={item.path}
        label={item.label}
        icon={item.icon}
        parent={item.parent}
        children={item.children?.map(mapper)}
      />
    );
    return items.map(mapper);
  }, [state]);

  const { width, scroll } = state.ui.globalNavigation;

  const contextMenu: ContextMenu = {
    name: "globalNavigation",
    items: (t) => [
      {
        text: "HI",
        command: "",
      },
    ],
  };

  return (
    <Resizable
      width={width}
      onResize={(newWidth) => execute("globalNavigation.resizeWidth", newWidth)}
    >
      <Scrollable
        scroll={scroll}
        onScroll={(newScroll) =>
          execute("globalNavigation.updateScroll", newScroll)
        }
      >
        <Focusable name="globalNavigation">
          <ContextMenuComp menu={contextMenu}>{menus}</ContextMenuComp>
        </Focusable>
      </Scrollable>
    </Resizable>
  );
}

/*
 * <Resizable>
 *   <Scrollable>
 *     <Focusable>
 *       <ContextMenu>
 *         {children}
 *       </ContextMenu>
 *     </Focusable>
 *   </Scrollable>
 * </Resizable
 */
