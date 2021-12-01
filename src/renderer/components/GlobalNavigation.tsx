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
import {
  addChild,
  NavigationMenu,
  NavigationMenuProps,
} from "./shared/NavigationMenu";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";

export function GlobalNavigation(): JSX.Element {
  console.log("GlobalNavigation()");

  const { state, execute } = useAppContext();
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

  for (const tag of state.tags.values) {
    addChild(tags, {
      label: tag.name,
      path: `tags/${tag.name}`,
    });
  }

  if (state.tags.input != null) {
    addChild(tags, {
      path: "tags/___input",
      enableInput: true,
      label: state.tags.input.value,
      onInputCancel: state.tags.input.cancel,
      onInputConfirm: state.tags.input.confirm,
    });
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
      enableInput={item.enableInput}
      onInputCancel={item.onInputCancel}
      onInputConfirm={item.onInputConfirm}
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
