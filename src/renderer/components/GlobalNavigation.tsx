import {
  faBook,
  faFile,
  faStar,
  faTag,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import React, { createRef, useMemo, useRef } from "react";
import { useAppContext } from "../App";
import { ContextMenu } from "./shared/ContextMenu";
import { Focusable } from "./shared/Focusable";
import { NavigationMenu, NavigationMenuProps } from "./shared/NavigationMenu";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";

export function GlobalNavigation(): JSX.Element {
  const { state, execute } = useAppContext();
  console.log("Global nav render!");
  /**
   * Generate the navigation menu components. This isn't something we want
   * to do unless things change so we memo it to save on performace costs
   */
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

  console.log("RENDER tags");
  if (state.tags.input != null) {
    console.log("INPUT STARTED!");
  }

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
  const renderedItems = items.map(mapper);

  const { width, scroll } = state.ui.globalNavigation;

  let contextMenuItems = (t: HTMLElement) => [
    {
      text: "Create tag",
      command: "globalNavigation.createTag",
    },
  ];

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
          <ContextMenu name="globalNavigation" items={contextMenuItems}>
            {renderedItems}
          </ContextMenu>
        </Focusable>
      </Scrollable>
    </Resizable>
  );
}
