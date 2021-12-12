import React, { useMemo } from "react";
import { PropsWithChildren } from "react";
import { classList, px } from "../../../shared/dom";

export interface NavigationMenuProps {
  name: string;
  trigger: JSX.Element;
  collapsed: boolean;
  selected?: boolean;
}

export function NavigationMenu(props: PropsWithChildren<NavigationMenuProps>) {
  const classes = classList(
    "navigation-menu-trigger",
    props.selected ? "has-background-primary" : ""
  );

  return (
    <div className="navigation-menu" data-navigation-menu={props.name}>
      <div className={classes}>{props.trigger}</div>
      {props.children}
    </div>
  );
}
