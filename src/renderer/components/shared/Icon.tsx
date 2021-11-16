import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee, IconDefinition } from "@fortawesome/free-solid-svg-icons";

export interface IconProps {
  icon: IconDefinition;
  title?: string;
}

export interface IconButtonProps extends IconProps {
  onClick?: () => any;
}

export function Icon(props: IconProps) {
  return <FontAwesomeIcon className="normal-icon" {...props} />;
}

export function IconButton(props: IconButtonProps) {
  return (
    <button className="button-icon">
      <FontAwesomeIcon {...props} />
    </button>
  );
}
