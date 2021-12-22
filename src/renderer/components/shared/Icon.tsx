import React from "react";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { classList } from "../../../shared/dom";
import { BulmaColor, BulmaSize, ButtonType } from "../../shared";

export interface IconProps {
  icon: IconDefinition;
  className?: string;
  title?: string;
  size?: BulmaSize;
  color?: BulmaColor;
}

const FONT_AWESOME_SIZE_MAP: Record<BulmaSize, FontAwesomeIconProps["size"]> = {
  "is-small": "xs",
  "is-normal": "1x",
  "is-medium": "lg",
  "is-large": "2x",
};

export function Icon(props: IconProps) {
  let size = props.size ?? "is-normal";

  const containerClasses = classList("icon", "m-0", size, props.className);

  let fontAwesomeSize = FONT_AWESOME_SIZE_MAP[size];

  return (
    <i className={containerClasses}>
      <FontAwesomeIcon
        icon={props.icon}
        title={props.title}
        size={fontAwesomeSize}
      />
    </i>
  );
}
