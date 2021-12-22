import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import React, { useMemo } from "react";
import { PropsWithChildren } from "react";
import { classList, px } from "../../../shared/dom";
import { Icon } from "./Icon";

export interface NavigationMenuProps {
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
    <div className="navigation-menu" data-navigation-menu={props.name}>
      <div className={classes}>
        <div className="px-2 py-1 is-flex is-flex-row is-align-items-center has-text-grey is-size-6">
          {props.icon != null && <Icon icon={props.icon} className="mr-1" />}
          <span>{props.text}</span>
        </div>
      </div>
      {props.children}
    </div>
  );
}
