import React, { PropsWithChildren } from "react";
import { px } from "../../shared/dom";
import { State } from "../../shared/state";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { Filter } from "./Filter";
import { ContextMenu } from "./shared/ContextMenu";
import { Focusable } from "./shared/Focusable";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";

export interface SidebarProps {
  state: State;
  setUI: SetUI;
  execute: Execute;
}

export function Sidebar({
  state,
  setUI,
  execute,
  children,
}: PropsWithChildren<SidebarProps>) {
  let contextMenuItems = () => [];
  const width = px(300);
  const scroll = 0;

  const onResize = () => {};
  const onScroll = () => {};

  let menus: JSX.Element[] = [];

  return (
    <Resizable width={width} onResize={onResize}>
      <Scrollable scroll={scroll} onScroll={onScroll}>
        <Focusable
          name="globalNavigation"
          className="is-flex is-flex-grow-1 is-flex-direction-column"
        >
          <ContextMenu
            name="globalNavigation"
            items={contextMenuItems}
            state={state}
            execute={execute}
            setUI={setUI}
          >
            <Filter />
            {menus}
          </ContextMenu>
        </Focusable>
      </Scrollable>
    </Resizable>
  );
}
