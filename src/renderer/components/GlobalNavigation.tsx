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
import {
  ContextMenu,
  ContextMenuDivider,
  ContextMenuItem,
} from "./shared/ContextMenu";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";
import { Input } from "./shared/Input";
import { NavigationMenu } from "./shared/NavigationMenu";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";
import * as yup from "yup";

export interface GlobalNavigationProps {
  state: State;
  execute: Execute;
}

export function GlobalNavigation({
  state,
  execute,
}: GlobalNavigationProps): JSX.Element {
  const all = (
    <NavigationMenu
      collapsed={false}
      trigger={buildTrigger("ALL", faFile)}
      key="all"
    ></NavigationMenu>
  );

  const notebooks = (
    <NavigationMenu
      collapsed={false}
      trigger={buildTrigger("NOTEBOOKS", faBook)}
      key="notebooks"
    ></NavigationMenu>
  );

  const sortedTags = sortBy(state.tags, "name");
  const tagsChildren = useMemo(() => {
    const tags = [];

    for (const tag of sortedTags) {
      tags.push(
        <NavigationMenu
          collapsed={false}
          trigger={buildTrigger(tag.name)}
          depth={1}
          key={`tags/${tag.name}`}
        ></NavigationMenu>
      );
    }

    const tagSchema = getTagSchema(state.tags);

    const tagsInput = state.ui.globalNavigation.tagInput;
    if (tagsInput?.mode === "create") {
      tags.push(
        <NavigationMenu
          collapsed={false}
          trigger={
            <Input
              className="global-navigation-input"
              {...tagsInput}
              schema={yup.reach(tagSchema, "name").notOneOf(
                state.tags.map((t) => t.name),
                "Tag already exists"
              )}
            />
          }
          depth={1}
          key="tags/input"
        />
      );
    }

    return tags;
  }, [sortedTags, state.ui.globalNavigation.tagInput]);

  const tags = (
    <NavigationMenu
      collapsed={false}
      trigger={buildTrigger("TAGS", faTag)}
      key="tags"
    >
      {tagsChildren}
    </NavigationMenu>
  );

  const favorites = (
    <NavigationMenu
      collapsed={false}
      trigger={buildTrigger("FAVORITES", faStar)}
      key="favorites"
    ></NavigationMenu>
  );

  const trash = (
    <NavigationMenu
      collapsed={false}
      trigger={buildTrigger("TRASH", faTrash)}
      key="trash"
    ></NavigationMenu>
  );

  // TODO: Allow user to customize order
  const menus = [all, notebooks, tags, favorites, trash];

  // Recursively render the menus
  // const mapper = (item: NavigationMenuProps & { path: string }) => (
  //   <NavigationMenu collapsed={false} key={item.path} parent={item.parent} />
  // );

  const { width, scroll } = state.ui.globalNavigation;

  let contextMenuItems: ContextMenuItem[] = [
    {
      type: "option",
      text: "Create tag",
      command: "globalNavigation.createTag",
    },
  ];

  const onResize = (newWidth: string) => {
    execute("globalNavigation.resizeWidth", newWidth);
  };

  return (
    <Resizable width={width} onResize={onResize}>
      <Scrollable
        scroll={scroll}
        onScroll={(newScroll) =>
          execute("globalNavigation.updateScroll", newScroll)
        }
      >
        <Focusable name="globalNavigation">
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

export function buildTrigger(text: string, icon?: IconDefinition): JSX.Element {
  return (
    <div className="m-1 is-flex is-flex-row is-align-items-center has-text-grey is-size-7">
      {icon != null && <Icon icon={icon} className="mr-1" />}
      <span>{text}</span>
    </div>
  );
}
