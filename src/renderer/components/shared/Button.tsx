import React, { PropsWithChildren } from "react";
// import { classList } from "../../../shared/dom";

export type ButtonColor =
  | "is-primary"
  | "is-link"
  | "is-info"
  | "is-success"
  | "is-warning"
  | "is-danger"
  | "is-white"
  | "is-light"
  | "is-dark"
  | "is-black";

export type BulmaSize = "is-small" | "is-normal" | "is-medium" | "is-large";

export type ButtonType = "submit" | "reset" | "button";

export interface ButtonProps {
  onClick?: () => any;
  type?: ButtonType;
  size?: BulmaSize;
  color?: ButtonColor | "is-text" | "is-ghost";
  isInverted?: boolean;
  isOutlined?: boolean;
  isRounded?: boolean;
  isLoading?: boolean;
  className?: string;
  title?: string;
}

export function Button(props: PropsWithChildren<ButtonProps>) {
  // const classes = classList(
  //   "button",
  //   props.className,
  //   props.color,
  //   props.size,
  //   {
  //     "is-inverted": props.isInverted,
  //     "is-outlined": props.isOutlined,
  //     "is-rounded": props.isRounded,
  //     "is-loading": props.isLoading,
  //   }
  // );

  return (
    <button
      title={props.title}
      type={props.type ?? "button"}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
