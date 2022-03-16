import React from "react";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { classList } from "../../../shared/dom";

export interface IconProps {
  icon: IconDefinition;
  className?: string;
  title?: string;
  size?: FontAwesomeIconProps["size"];
  color?: string;
}

export function Icon(props: IconProps) {
  const size = props.size ?? "is-normal";
  let color;
  if (props.color) {
    color = `has-text-${props.color.split("-")[1]}`;
  }

  const containerClasses = classList(
    "icon",
    "m-0",
    size,
    props.className,
    color
  );

  return (
    <i className={containerClasses}>
      <FontAwesomeIcon
        icon={props.icon}
        title={props.title}
        size={props.size}
      />
    </i>
  );
}
