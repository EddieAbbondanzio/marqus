import React, { useMemo } from "react";
import { PropsWithChildren } from "react";
import { px } from "../../../shared/dom/units";

const INDENT_PIXELS = 20;

export interface NavigationMenuProps {
  trigger: JSX.Element;
  collapsed: boolean;
  depth?: number;
}

export function NavigationMenu(props: PropsWithChildren<NavigationMenuProps>) {
  const indent = px((props.depth ?? 0) * INDENT_PIXELS);

  return (
    <div style={{ paddingLeft: indent }}>
      {props.trigger}
      {props.children}
    </div>
  );
}
