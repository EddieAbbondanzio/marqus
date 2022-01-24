import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import React, { useMemo } from "react";
import { PropsWithChildren } from "react";
import { classList, px } from "../../../shared/dom";
import { EntityType } from "../../../shared/domain/entities";
import { Focusable } from "../Focusable";
import { Icon } from "./Icon";

export const NAV_MENU_ATTRIBUTE = "data-nav-menu";

export interface NavMenuProps {
  id: string;
  name: string;
  icon?: IconDefinition;
  text: string;
  collapsed?: boolean;
  selected?: boolean;
  onClick?: () => any;
  onBlur?: () => any;
}

export function NavMenu(props: PropsWithChildren<NavMenuProps>) {
  const triggerClasses = classList("nav-menu-trigger");

  const menuClasses = classList(
    "nav-menu",
    "is-flex",
    "is-align-items-center",
    { "has-background-primary": props.selected }
  );

  return (
    <div
      className={menuClasses}
      style={{ height: px(30) }}
      onClick={() => props.onClick?.()}
      {...{ [NAV_MENU_ATTRIBUTE]: props.id }}
    >
      <Focusable
        name={props.id}
        className="h-100 is-flex is-align-items-center is-flex-grow-1"
        onBlur={props.onBlur}
      >
        <div className={triggerClasses}>
          <div className="px-2 is-flex is-flex-row is-align-items-center has-text-dark is-size-7">
            {props.icon != null && <Icon icon={props.icon} className="mr-1" />}
            <span>{props.text}</span>
          </div>
        </div>
      </Focusable>
      {props.children}
    </div>
  );
}

export function parseNavMenuAttr(value: string) {
  if (!/^(tag|notebook|note).\S+$/.test(value)) {
    throw Error(`Invalid nav menu attribute ${value}`);
  }

  return value.split(".") as [EntityType, string];
}
