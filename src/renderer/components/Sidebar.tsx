import React from "react";
import { px } from "../../shared/dom";
import { State } from "../../shared/domain/state";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { Filter } from "./Filter";
import { ContextMenu } from "./shared/ContextMenu";
import { Explorer } from "./Explorer";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";
import { Focusable } from "./Focusable";

export interface SidebarProps {
  state: State;
  setUI: SetUI;
  execute: Execute;
}

export function Sidebar({ state, setUI, execute }: SidebarProps) {
  let contextMenuItems = () => [];

  return (
    <Resizable
      minWidth={px(320)}
      width={state.ui.sidebar.width}
      onResize={(w) => execute("sidebar.resizeWidth", w)}
    >
      <Scrollable
        scroll={state.ui.sidebar.scroll}
        onScroll={(s) => execute("sidebar.updateScroll", s)}
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
      </Scrollable>
    </Resizable>
  );
}
