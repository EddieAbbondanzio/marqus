import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import React, { useMemo } from "react";
import { PropsWithChildren } from "react";
import { classList, px } from "../../../shared/dom";
import { Icon } from "./Icon";

export const NAVIGATION_MENU_ATTRIBUTE = "data-navigation-menu";

export interface NavigationMenuProps {
  id?: string;
  name: string;
  icon?: IconDefinition;
  text: string;
  collapsed?: boolean;
  selected?: boolean;
}

export function NavigationMenu(props: PropsWithChildren<NavigationMenuProps>) {
  const classes = classList(
    "navigation-menu-trigger",
    props.selected ? "has-background-primary" : ""
  );

  return (
    <div
      className="navigation-menu is-flex is-align-items-center"
      data-navigation-menu={props.id}
      style={{ height: px(30) }}
    >
      <div className={classes}>
        <div className="px-2 is-flex is-flex-row is-align-items-center has-text-dark is-size-7">
          {props.icon != null && <Icon icon={props.icon} className="mr-1" />}
          <span>{props.text}</span>
        </div>
      </div>
      {props.children}
    </div>
  );
}
