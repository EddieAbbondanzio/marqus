import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useMemo, useRef } from "react";
import { PropsWithChildren } from "react";
import { classList, px } from "../../../shared/dom";
import { Icon } from "./Icon";

export const NAV_MENU_ATTRIBUTE = "data-nav-menu";
export const COLLAPSED_ICON = faCaretRight;
export const EXPANDED_ICON = faCaretDown;

export interface NavMenuProps {
  id: string;
  icon?: IconDefinition;
  text: string;
  collapsed?: boolean;
  selected?: boolean;
  onClick?: () => any;
  expanded?: boolean;
}

export function NavMenu(props: PropsWithChildren<NavMenuProps>) {
  const triggerClasses = classList(
    "nav-menu-trigger",
    "is-flex",
    "is-align-items-center",
    "has-background-primary-hover",
    { "has-background-primary": props.selected }
  );

  const wrapperClasses = classList(
    "nav-menu",
    "is-flex",
    "is-justify-content-center",
    "is-flex-direction-column"
  );

  const onClick = (ev: React.MouseEvent<HTMLElement>) => {
    // Support nested nav menus
    ev.stopPropagation();
    props.onClick?.();
  };

  // Override icon to expanded / collapsed if we have children
  let icon = props.icon;
  if (props.children != null) {
    icon = props.expanded ? EXPANDED_ICON : COLLAPSED_ICON;
  }

  return (
    <div
      className={wrapperClasses}
      onClick={onClick}
      {...{ [NAV_MENU_ATTRIBUTE]: props.id }}
    >
      <a className={triggerClasses} style={{ height: px(30) }}>
        <div className="px-2 is-flex is-flex-row is-align-items-center has-text-dark is-size-7">
          {icon != null && <Icon icon={icon} className="mr-1" />}
          <span>{props.text}</span>
        </div>
      </a>
      {props.expanded && props.children}
    </div>
  );
}
