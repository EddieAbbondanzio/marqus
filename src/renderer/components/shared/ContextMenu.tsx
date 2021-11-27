import React from "react";
import { PropsWithChildren } from "react";
import { ContextMenu } from "../../../shared/ui/contextMenu";

export interface ContextMenuProps {
  menu: ContextMenu;
}

export function ContextMenu(props: PropsWithChildren<ContextMenuProps>) {
  return (
    <div
      className="is-flex is-flex-direction-column is-flex-grow-1"
      data-context-menu={props.menu.name}
    >
      {props.children}
    </div>
  );
}
