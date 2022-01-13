import React from "react";
import { px } from "../../shared/dom";
import { State } from "../../shared/domain/state";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { Filter } from "./Filter";
import { ContextMenu, ContextMenuItem } from "./shared/ContextMenu";
import { Explorer } from "./Explorer";
import { Resizable } from "./shared/Resizable";
import { Focusable } from "./Focusable";
import { NAVIGATION_MENU_ATTRIBUTE } from "./shared/NavigationMenu";
import { findParent } from "../utils/findParent";
import { NotImplementedError } from "../../shared/errors";

export interface SidebarProps {
  state: State;
  setUI: SetUI;
  execute: Execute;
}

export function Sidebar({ state, setUI, execute }: SidebarProps) {
  let contextMenuItems = (a: MouseEvent) => {
    const contextMenuAttr = findParent(
      a.target as HTMLElement,
      (el) => el.hasAttribute(NAVIGATION_MENU_ATTRIBUTE),
      {
        matchValue: (el) => el.getAttribute(NAVIGATION_MENU_ATTRIBUTE),
      }
    );

    if (contextMenuAttr == null) {
      return [];
    }

    const [type, id] = contextMenuAttr.split(".");
    const items = [];
    switch (type) {
      case "tag":
        items.push(
          <ContextMenuItem
            text="Rename"
            command="sidebar.renameTag"
            commandInput={id}
            key="renameTag"
          />,
          <ContextMenuItem
            text="Delete"
            command="sidebar.deleteTag"
            commandInput={id}
            key="deleteTag"
          />
        );
        break;

      case "notebook":
        throw new NotImplementedError();
      case "note":
        throw new NotImplementedError();
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
          name="sidebar"
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
