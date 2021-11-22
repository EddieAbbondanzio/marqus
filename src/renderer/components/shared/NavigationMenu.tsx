import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import React, { PropsWithChildren, ReactNode, useMemo } from "react";
import { px } from "../../../shared/dom/units";
import { Icon } from "./Icon";

export interface NavigationMenuProps {
  icon?: IconDefinition;
  label: string;
  parent?: NavigationMenuProps;
  children?: any[];
  expanded?: boolean;
}

export function NavigationMenu(props: NavigationMenuProps) {
  // Root menu labels are ALL CAPS
  const formattedLabel =
    props.parent == null ? props.label.toUpperCase() : props.label;

  const indent = useMemo(
    () => calculateIndent(props),
    [props.children, props.parent]
  );

  return (
    <div style={{ paddingLeft: indent }}>
      <div className="m-1 is-flex is-flex-row is-align-items-center">
        {props.icon && (
          <Icon icon={props.icon} className="mr-1 has-text-grey" />
        )}
        <span className="is-size-7">{formattedLabel}</span>
      </div>
      {props.children}
    </div>
  );
}

export function addChild(
  parent: NavigationMenuProps,
  child: NavigationMenuProps
) {
  parent.children ??= [];
  parent.children?.push(child);
  child.parent = parent;
}

const INDENT_PIXELS = 20;

export function calculateIndent(menu: NavigationMenuProps) {
  let indent = 0;
  let curr;

  curr = menu;
  while (curr.parent != null) {
    indent++;
    curr = curr.parent;
  }

  return px(indent * INDENT_PIXELS);
}
