import OpenColor from "open-color";
import { transparentize } from "polished";
import React from "react";
import { PropsWithChildren } from "react";
import styled from "styled-components";
import { p2, rounded } from "../../css";

export function Modal({ children }: PropsWithChildren<unknown>): JSX.Element {
  return (
    <Background>
      <ModalCard>{children}</ModalCard>
    </Background>
  );
}

export const Background = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${transparentize(0.6, OpenColor.gray[9])};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
`;

export const ModalCard = styled.div`
  background-color: ${OpenColor.gray[1]};
  height: 32rem;
  width: 48rem;
  display: flex;
  align-items: center;
  ${rounded}
  ${p2}
`;
