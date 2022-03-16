import React, { useContext, useEffect } from "react";
import { px } from "../../shared/dom";
import { ContextMenu, ContextMenuItem } from "./shared/ContextMenu";
import { Explorer } from "./Explorer";
import { Resizable } from "./shared/Resizable";
import { Focusable } from "./shared/Focusable";
import { NAV_MENU_ATTRIBUTE } from "./ExplorerItems";
import { findParent } from "../utils/findParent";
import { parseResourceId } from "../../shared/domain/id";
import { Store, StoreListener } from "../store";
import styled from "styled-components";
import { THEME } from "../styling/theme";

export interface SidebarProps {
  store: Store;
}

export function Sidebar({ store }: SidebarProps) {
  let contextMenuItems = (a: MouseEvent) => {
    const items = [];
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
            eventInput={target}
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

  useEffect(() => {
    store.on("sidebar.resizeWidth", resizeWidth);

    return () => {
      store.off("sidebar.resizeWidth", resizeWidth);
    };
  }, [store.state]);

  return (
    <StyledResizable
      minWidth={px(300)}
      width={store.state.ui.sidebar.width}
      onResize={(w) => store.dispatch("sidebar.resizeWidth", w)}
    >
      <StyledFocusable store={store} name="sidebar">
        <ContextMenu name="contextMenu" items={contextMenuItems} store={store}>
          <Explorer store={store} />
        </ContextMenu>
      </StyledFocusable>
    </StyledResizable>
  );
}

export const StyledResizable = styled(Resizable)`
  background-color: ${THEME.sidebar.background};
`;

export const StyledFocusable = styled(Focusable)`
  width: 100%;
  height: 100%;
`;

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
