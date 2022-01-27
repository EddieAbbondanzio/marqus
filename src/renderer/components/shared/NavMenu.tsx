import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import React, { useEffect, useMemo, useRef } from "react";
import { PropsWithChildren } from "react";
import { classList, px } from "../../../shared/dom";
import { EntityType } from "../../../shared/domain/entities";
import { KeyCode } from "../../../shared/io/keyCode";
import { parseFullyQualifiedId } from "../../../shared/utils";
import { useKeyboard } from "../../io/keyboard";
import { Icon } from "./Icon";

export const NAV_MENU_ATTRIBUTE = "data-nav-menu";

export interface NavMenuProps {
  id: string;
  icon?: IconDefinition;
  text: string;
  collapsed?: boolean;
  selected?: boolean;
  onClick?: () => any;
  onEsc?: () => any;
}

export function NavMenu(props: PropsWithChildren<NavMenuProps>) {
  const triggerClasses = classList("nav-menu-trigger");

  const menuClasses = classList(
    "nav-menu",
    "is-flex",
    "is-align-items-center",
    { "has-background-primary": props.selected }
  );

  const wrapper = useRef(null! as HTMLDivElement);
  const kb = useKeyboard(wrapper);
  kb.listen({ keys: [KeyCode.Enter], event: "keydown" }, async (ev) => {
    ev.stopPropagation();
    console.log("Key press!");
  });

  return (
    <div
      ref={wrapper}
      className={menuClasses}
      style={{ height: px(30) }}
      onClick={() => props.onClick?.()}
      {...{ [NAV_MENU_ATTRIBUTE]: props.id }}
    >
      <div className={triggerClasses}>
        <div className="px-2 is-flex is-flex-row is-align-items-center has-text-dark is-size-7">
          {props.icon != null && <Icon icon={props.icon} className="mr-1" />}
          <span>{props.text}</span>
        </div>
      </div>
      {props.children}
    </div>
  );
}
