import React, { useContext, useEffect } from "react";
import { px } from "../../shared/dom";
import { Filter } from "./Filter";
import { ContextMenu, ContextMenuItem } from "./shared/ContextMenu";
import { Explorer } from "./Explorer";
import { Resizable } from "./shared/Resizable";
import { Focusable } from "./shared/Focusable";
import { NAV_MENU_ATTRIBUTE } from "./ExplorerItems";
import { findParent } from "../utils/findParent";
import { parseResourceId } from "../../shared/domain/id";
import { Store, StoreListener } from "../store";

export interface SidebarProps {
  store: Store;
}

export function Sidebar({ store }: SidebarProps) {
  let contextMenuItems = (a: MouseEvent) => {
    const { state } = store;
    const items = [];
    const { view } = state.ui.sidebar.explorer;
    switch (view) {
      case "tags":
        items.push(
          <ContextMenuItem
            text="New tag"
            event="sidebar.createTag"
            key="createTag"
          />
        );
        break;

      case "notebooks":
        items.push(
          <ContextMenuItem
            text="New Note"
            event="sidebar.createNote"
            key="createNote"
          />,
          <ContextMenuItem
            text="New Notebook"
            event="sidebar.createNotebook"
            key="createNotebook"
          />
        );
        break;

      case "all":
        items.push(
          <ContextMenuItem
            text="New Note"
            event="sidebar.createNote"
            key="createNote"
          />
        );
        break;
    }

    const target = findParent(
      a.target as HTMLElement,
      (el) => el.hasAttribute(NAV_MENU_ATTRIBUTE),
      {
        matchValue: (el) => el.getAttribute(NAV_MENU_ATTRIBUTE),
      }
    );
    if (target == null) {
      return items;
    }

    const [targetType] = parseResourceId(target);
    switch (targetType) {
      case "tag":
        items.push(
          <ContextMenuItem
            text="Rename"
            event="sidebar.renameTag"
            eventInput={target}
            key="renameTag"
          />,
          <ContextMenuItem
            text="Delete"
            event="sidebar.deleteTag"
            eventInput={target}
            key="deleteTag"
          />
        );
        break;

      case "notebook":
        items.push(
          <ContextMenuItem
            text="Rename"
            event="sidebar.renameNotebook"
            key="renameNotebook"
            eventInput={{ id: target }}
          />,
          <ContextMenuItem
            text="Delete"
            event="sidebar.deleteNotebook"
            eventInput={target}
            key="deleteNotebook"
          />
        );
        break;

      case "note":
        items.push(
          <ContextMenuItem
            text="Rename"
            event="sidebar.renameNote"
            eventInput={target}
            key="renameNote"
          />,
          <ContextMenuItem
            text="Delete"
            event="sidebar.deleteNote"
            eventInput={target}
            key="deleteTag"
          />
        );
        break;
    }

    return items;
  };

  return (
    <Resizable
      minWidth={px(300)}
      width={store.state.ui.sidebar.width}
      onResize={(w) => store.dispatch("sidebar.resizeWidth", w)}
    >
      <Focusable
        name="sidebar"
        className="is-flex is-flex-grow-1 is-flex-direction-column"
      >
        <ContextMenu
          name="sidebarContextMenu"
          items={contextMenuItems}
          store={store}
        >
          <Filter store={store} />
          <Explorer store={store} />
        </ContextMenu>
      </Focusable>
    </Resizable>
  );
}

export const resizeWidth: StoreListener<"sidebar.resizeWidth"> = (
  { value: width },
  ctx
) => {
  if (width == null) {
    throw Error();
  }

  ctx.setUI({
    sidebar: {
      width,
    },
  });
};
