import React, { MouseEventHandler } from "react";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { m1 } from "../../css";
import styled from "styled-components";

export interface IconProps {
  icon: IconDefinition;
  className?: string;
  title?: string;
  size?: FontAwesomeIconProps["size"];
  onClick?: MouseEventHandler;
  transform?: FontAwesomeIconProps["transform"];
}

export function Icon(props: IconProps): JSX.Element {
  return (
    <StyledI className={props.className} onClick={props.onClick}>
      <FontAwesomeIcon
        icon={props.icon}
        title={props.title}
        size={props.size}
        transform={props.transform}
      />
    </StyledI>
  );
}

const StyledI = styled.i`
  ${m1}
`;
