import React, { useContext, useEffect } from "react";
import { px } from "../../shared/dom";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { Filter } from "./Filter";
import { ContextMenu, ContextMenuItem } from "./shared/ContextMenu";
import { Explorer } from "./Explorer";
import { Resizable } from "./shared/Resizable";
import { Focusable } from "./shared/Focusable";
import { NAV_MENU_ATTRIBUTE } from "./ExplorerItems";
import { findParent } from "../utils/findParent";
import { State } from "../store/state";
import { parseResourceId } from "../../shared/domain/id";
import { Store, StoreListener } from "../store";

export interface SidebarProps {
  store: Store;
  state: State;
  setUI: SetUI;
  execute: Execute;
}

export function Sidebar({ state, setUI, execute }: SidebarProps) {
  let contextMenuItems = (a: MouseEvent) => {
    const items = [];
    const { view } = state.ui.sidebar.explorer;
    switch (view) {
      case "tags":
        items.push(
          <ContextMenuItem
            text="New tag"
            command="sidebar.createTag"
            key="createTag"
          />
        );
        break;

      case "notebooks":
        items.push(
          <ContextMenuItem
            text="New Note"
            command="sidebar.createNote"
            key="createNote"
          />,
          <ContextMenuItem
            text="New Notebook"
            command="sidebar.createNotebook"
            key="createNotebook"
          />
        );
        break;

      case "all":
        items.push(
          <ContextMenuItem
            text="New Note"
            command="sidebar.createNote"
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
            command="sidebar.renameTag"
            commandInput={target}
            key="renameTag"
          />,
          <ContextMenuItem
            text="Delete"
            command="sidebar.deleteTag"
            commandInput={target}
            key="deleteTag"
          />
        );
        break;

      case "notebook":
        items.push(
          <ContextMenuItem
            text="Rename"
            command="sidebar.renameNotebook"
            key="renameNotebook"
            commandInput={target}
          />,
          <ContextMenuItem
            text="Delete"
            command="sidebar.deleteNotebook"
            commandInput={target}
            key="deleteNotebook"
          />
        );
        break;

      case "note":
        items.push(
          <ContextMenuItem
            text="Rename"
            command="sidebar.renameNote"
            commandInput={target}
            key="renameNote"
          />,
          <ContextMenuItem
            text="Delete"
            command="sidebar.deleteNote"
            commandInput={target}
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
      width={state.ui.sidebar.width}
      onResize={(w) => execute("sidebar.resizeWidth", w)}
    >
      <Focusable
        name="sidebar"
        className="is-flex is-flex-grow-1 is-flex-direction-column"
      >
        <ContextMenu
          name="sidebarContextMenu"
          items={contextMenuItems}
          state={state}
          execute={execute}
          setUI={setUI}
        >
          <Filter state={state} setUI={setUI} execute={execute} />
          <Explorer state={state} setUI={setUI} execute={execute} />
        </ContextMenu>
      </Focusable>
    </Resizable>
  );
}
