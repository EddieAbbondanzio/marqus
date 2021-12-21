import React, { PropsWithChildren } from "react";
import { classList } from "../../../shared/dom";
import { BulmaColor, BulmaSize, ButtonType } from "../../shared";

export interface ButtonProps {
  onClick?: () => any;
  type?: ButtonType;
  size?: BulmaSize;
  color?: BulmaColor | "is-text" | "is-ghost";
  isInverted?: boolean;
  isOutlined?: boolean;
  isRounded?: boolean;
  isLoading?: boolean;
}

export function Button(props: PropsWithChildren<ButtonProps>) {
  const classes = classList("button", props.color, props.size, {
    "is-inverted": props.isInverted,
    "is-outlined": props.isOutlined,
    "is-rounded": props.isRounded,
    "is-loading": props.isLoading,
  });

  return (
    <button
      className={classes}
      type={props.type ?? "button"}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
