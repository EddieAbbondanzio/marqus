import React from "react";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { m1 } from "../../styling";
import styled from "styled-components";

export interface IconProps {
  icon: IconDefinition;
  className?: string;
  title?: string;
  size?: FontAwesomeIconProps["size"];
  color?: string;
}

export function Icon(props: IconProps) {
  const size = props.size ?? "is-normal";

  return (
    <StyledI className={props.className}>
      <FontAwesomeIcon
        icon={props.icon}
        title={props.title}
        size={props.size}
      />
    </StyledI>
  );
}

const StyledI = styled.i`
  ${m1}
`;
