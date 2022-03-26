import React, { PropsWithChildren } from "react";
import styled from "styled-components";
import { p2, p3, rounded } from "../../css";

export type ButtonType = "submit" | "reset" | "button";

export interface ButtonProps {
  color?: string;
  backgroundColor?: string;
}

export const Button = styled.button<ButtonProps>`
  cursor: pointer;
  border: none;
  color: ${(props) => props.color};
  background-color: ${(props) => props.backgroundColor};
  ${p2};
  ${rounded};
`;
