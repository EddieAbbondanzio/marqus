import React, { useMemo } from "react";
import { PropsWithChildren } from "react";
import { px } from "../../../shared/dom";

const INDENT_PIXELS = 20;

export interface NavigationMenuProps {
  name: string;
  trigger: JSX.Element;
  collapsed: boolean;
  depth?: number;
}

export function NavigationMenu(props: PropsWithChildren<NavigationMenuProps>) {
  const indent = px((props.depth ?? 0) * INDENT_PIXELS);

  return (
    <div style={{ paddingLeft: indent }} data-navigation-menu={props.name}>
      {props.trigger}
      {props.children}
    </div>
  );
}
