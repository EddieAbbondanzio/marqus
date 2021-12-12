import React, { useMemo } from "react";
import { PropsWithChildren } from "react";
import { classList, px } from "../../../shared/dom";

const INDENT_PIXELS = 20;

export interface NavigationMenuProps {
  name: string;
  trigger: JSX.Element;
  collapsed: boolean;
  depth?: number;
  selected?: boolean;
}

export function NavigationMenu(props: PropsWithChildren<NavigationMenuProps>) {
  const classes = classList(props.selected ? "has-background-primary" : "");
  const indent = px((props.depth ?? 0) * INDENT_PIXELS);

  return (
    <div data-navigation-menu={props.name}>
      <div className={classes} style={{ paddingLeft: indent }}>
        {props.trigger}
      </div>
      {props.children}
    </div>
  );
}
