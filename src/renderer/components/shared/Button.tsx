import React, { PropsWithChildren } from "react";
import { classList } from "../../../shared/dom";
import { BulmaColor, BulmaSize, ButtonType } from "../../libs/shared";
import { IconProps } from "./Icon";

export interface ButtonProps {
  onClick?: () => any;
  type?: ButtonType;
  size?: BulmaSize;
  color?: BulmaColor | "is-text" | "is-ghost";
  isInverted?: boolean;
  isOutlined?: boolean;
  isRounded?: boolean;
  isLoading?: boolean;
  className?: string;
  title?: string;
}

export function Button(props: PropsWithChildren<ButtonProps>) {
  const classes = classList(
    "button",
    props.className,
    props.color,
    props.size,
    {
      "is-inverted": props.isInverted,
      "is-outlined": props.isOutlined,
      "is-rounded": props.isRounded,
      "is-loading": props.isLoading,
    }
  );

  return (
    <button
      className={classes}
      title={props.title}
      type={props.type ?? "button"}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
