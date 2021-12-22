import React, { PropsWithChildren } from "react";
import { classList } from "../../../shared/dom";
import { BulmaSize } from "../../shared";

export interface TabsProps {
  className?: string;
  size?: BulmaSize;
  alignment?: "is-centered" | "is-right";
}

export function Tabs(props: PropsWithChildren<TabsProps>) {
  const classes = classList(
    "tabs",
    props.className,
    props.size,
    props.alignment
  );

  return (
    <div className={classes}>
      <ul>{props.children}</ul>
    </div>
  );
}

export interface TabProps {
  title?: string;
  className?: string;
  isActive?: boolean;
  onClick?: () => any;
}

export function Tab(props: PropsWithChildren<TabProps>) {
  const classes = classList({ "is-active": props.isActive });
  return (
    <li className={classes} title={props.title}>
      <a className="p-3" onClick={props.onClick}>
        {props.children}
      </a>
    </li>
  );
}
