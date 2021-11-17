import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import React, { PropsWithChildren } from "react";
import { Icon } from "./Icon";

export interface NavigationMenuProps {
  icon?: IconDefinition;
  label: string;
}

export function NavigationMenu({
  icon,
  label,
  children,
}: PropsWithChildren<NavigationMenuProps>) {
  return (
    <div>
      <div className="m-1 is-flex is-flex-row is-align-items-center">
        {icon && <Icon icon={icon} className="mr-1 has-text-grey" />}
        <span className="is-size-7">{label}</span>
      </div>
      {children}
    </div>
  );
}
