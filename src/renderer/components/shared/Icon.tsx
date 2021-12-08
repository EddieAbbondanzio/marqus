import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { classList } from "../../../shared/dom";

/*
 * Icon component is only added to ensure both icons and button icons
 * default to the same initial color, size, and spacing.
 */

export interface IconProps {
  icon: IconDefinition;
  title?: string;
  className?: string;
}

export interface IconButtonProps extends IconProps {
  onClick?: () => any;
}

export function Icon(props: IconProps) {
  const classes = classList(props.className, "normal-icon");
  return <FontAwesomeIcon className={classes} {...props} />;
}

export function IconButton(props: IconButtonProps) {
  const classes = classList(props.className, "button-icon");
  return (
    <button className={classes}>
      <FontAwesomeIcon {...props} />
    </button>
  );
}
