import {
  faBook,
  faFile,
  faStar,
  faTag,
  faTrash,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { chain } from "lodash";
import React, { createRef, useMemo, useRef } from "react";
import { px } from "../../shared/dom/units";
import { useAppContext } from "../App";
import { ContextMenu } from "./shared/ContextMenu";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";
import { NavigationMenu, NavigationMenuProps } from "./shared/NavigationMenu";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";

export function GlobalNavigation(): JSX.Element {
  const { state, execute } = useAppContext();

  const all = (
    <NavigationMenu
      collapsed={false}
      key="all"
      trigger={buildTrigger("ALL", faFile)}
    ></NavigationMenu>
  );

  const notebooks = (
    <NavigationMenu
      collapsed={false}
      key="notebooks"
      trigger={buildTrigger("NOTEBOOKS", faBook)}
    ></NavigationMenu>
  );

  const tags = (
    <NavigationMenu
      collapsed={false}
      key="tags"
      trigger={buildTrigger("TAGS", faTag)}
    >
      <NavigationMenu
        collapsed={false}
        trigger={buildTrigger("TagA")}
      ></NavigationMenu>
    </NavigationMenu>
  );

  const favorites = (
    <NavigationMenu
      collapsed={false}
      key="favorites"
      trigger={buildTrigger("FAVORITES", faStar)}
    ></NavigationMenu>
  );

  const trash = (
    <NavigationMenu
      collapsed={false}
      key="trash"
      trigger={buildTrigger("TRASH", faTrash)}
    ></NavigationMenu>
  );

  // TODO: Allow user to customize order
  const menus = [all, notebooks, tags, favorites, trash];

  // Recursively render the menus
  // const mapper = (item: NavigationMenuProps & { path: string }) => (
  //   <NavigationMenu collapsed={false} key={item.path} parent={item.parent} />
  // );

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
            {menus}
          </ContextMenu>
        </Focusable>
      </Scrollable>
    </Resizable>
  );
}

export function buildTrigger(text: string, icon?: IconDefinition): JSX.Element {
  return (
    <div className="m-1 is-flex is-flex-row is-align-items-center has-text-grey is-size-7">
      {icon != null && <Icon icon={icon} className="mr-1" />}
      <span style={icon == null ? { paddingLeft: px(16) } : {}}>{text}</span>
    </div>
  );
}
