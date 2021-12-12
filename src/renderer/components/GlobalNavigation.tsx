import {
  faBook,
  faFile,
  faStar,
  faTag,
  faTrash,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { sortBy } from "lodash";
import React, { useMemo } from "react";
import { getTagSchema } from "../../shared/schemas";
import { State } from "../../shared/state";
import { Execute } from "../io/commands";
import { ContextMenu, ContextMenuItem } from "./shared/ContextMenu";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";
import { Input } from "./shared/Input";
import { NavigationMenu } from "./shared/NavigationMenu";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";
import * as yup from "yup";
import { findParent } from "../utils/findParent";

export interface GlobalNavigationProps {
  state: State;
  execute: Execute;
}

export function GlobalNavigation({
  state,
  execute,
}: GlobalNavigationProps): JSX.Element {
  const select = (name: string) => () =>
    execute("globalNavigation.setSelected", name);
  const isSelected = (name: string) =>
    name === state.ui.globalNavigation.selected;

  const all = (
    <NavigationMenu
      key="all"
      name="all"
      trigger={buildTrigger("ALL", {
        icon: faFile,
        onClick: select("all"),
      })}
      collapsed={false}
      selected={isSelected("all")}
    ></NavigationMenu>
  );

  const notebooks = (
    <NavigationMenu
      key="notebooks"
      name="notebooks"
      trigger={buildTrigger("NOTEBOOKS", {
        icon: faBook,
        onClick: select("notebooks"),
      })}
      collapsed={false}
      selected={isSelected("notebooks")}
    ></NavigationMenu>
  );

  const sortedTags = sortBy(state.tags, "name");
  const tagsChildren = useMemo(() => {
    const tags = [];
    const tagsInput = state.ui.globalNavigation.tagInput;
    const tagSchema = getTagSchema(state.tags);

    for (const tag of sortedTags) {
      const lookup = `tags/${tag.id}`;

      if (
        tagsInput != null &&
        tagsInput.mode === "update" &&
        tagsInput.id === tag.id
      ) {
        tags.push(
          <NavigationMenu
            key={lookup}
            name={lookup}
            trigger={
              <Input
                className="my-1 global-navigation-input"
                {...tagsInput}
                schema={yup.reach(tagSchema, "name")}
              />
            }
            collapsed={false}
          />
        );
      } else {
        tags.push(
          <NavigationMenu
            key={lookup}
            name={lookup}
            trigger={buildTrigger(tag.name, {
              onClick: select(lookup),
            })}
            collapsed={false}
            selected={isSelected(lookup)}
          ></NavigationMenu>
        );
      }
    }

    if (tagsInput?.mode === "create") {
      tags.push(
        <NavigationMenu
          key="tags/input"
          name="tags/input"
          trigger={
            <Input
              className="my-1 global-navigation-input"
              {...tagsInput}
              schema={yup.reach(tagSchema, "name")}
            />
          }
          collapsed={false}
        />
      );
    }

    return tags;
  }, [sortedTags, state.ui.globalNavigation.tagInput]);

  const tags = (
    <NavigationMenu
      key="tags"
      name="tags"
      trigger={buildTrigger("TAGS", {
        icon: faTag,
        onClick: select("tags"),
      })}
      collapsed={false}
      selected={isSelected("tags")}
    >
      {tagsChildren}
    </NavigationMenu>
  );

  const favorites = (
    <NavigationMenu
      key="favorites"
      name="favorites"
      trigger={buildTrigger("FAVORITES", {
        icon: faStar,
        onClick: select("favorites"),
      })}
      collapsed={false}
      selected={isSelected("favorites")}
    ></NavigationMenu>
  );

  const trash = (
    <NavigationMenu
      key="trash"
      name="trash"
      trigger={buildTrigger("TRASH", {
        icon: faTrash,
        onClick: select("trash"),
      })}
      collapsed={false}
      selected={isSelected("trash")}
    ></NavigationMenu>
  );

  // TODO: Allow user to customize order
  const menus = [all, notebooks, tags, favorites, trash];

  // Recursively render the menus
  // const mapper = (item: NavigationMenuProps & { path: string }) => (
  //   <NavigationMenu collapsed={false} key={item.path} parent={item.parent} />
  // );

  const { width, scroll } = state.ui.globalNavigation;

  const onResize = (newWidth: string) => {
    execute("globalNavigation.resizeWidth", newWidth);
  };

  let contextMenuItems = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    let menu: string | null = null;
    if (target != null) {
      menu = findParent(
        target,
        (el) => el.hasAttribute("data-navigation-menu"),
        {
          matchValue: (el) => el.getAttribute("data-navigation-menu"),
        }
      );

      console.log(menu);
    }

    let items: JSX.Element[] = [];

    if (menu?.startsWith("tags")) {
      items.push(
        <ContextMenuItem
          text="Create tag"
          command="globalNavigation.createTag"
          key="0"
        />
      );

      if (menu?.startsWith("tags/")) {
        const id = menu.split("/")[1];

        items.push(
          <ContextMenuItem
            text="Update tag"
            command="globalNavigation.updateTag"
            commandInput={id}
            key="1"
          />
        );
        items.push(
          <ContextMenuItem
            text="Delete tag"
            command="globalNavigation.deleteTag"
            commandInput={id}
            key="2"
          />
        );
      }
    }

    return items;
  };

  return (
    <Resizable width={width} onResize={onResize}>
      <Scrollable
        scroll={scroll}
        onScroll={(newScroll) =>
          execute("globalNavigation.updateScroll", newScroll)
        }
      >
        <Focusable
          name="globalNavigation"
          className="is-flex is-flex-grow-1 is-flex-direction-column"
        >
          <ContextMenu
            name="globalNavigation"
            items={contextMenuItems}
            state={state}
            execute={execute}
          >
            {menus}
          </ContextMenu>
        </Focusable>
      </Scrollable>
    </Resizable>
  );
}

export function buildTrigger(
  text: string,
  opts?: { icon?: IconDefinition; onClick?: () => void }
): JSX.Element {
  return (
    <a
      className="p-1 is-flex is-flex-row is-align-items-center has-text-grey is-size-7"
      onClick={() => opts?.onClick?.()}
    >
      {opts?.icon != null && <Icon icon={opts.icon} className="mr-1" />}
      <span>{text}</span>
    </a>
  );
}
