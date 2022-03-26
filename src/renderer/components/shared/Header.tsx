import React from "react";
import { PropsWithChildren } from "react";
import styled from "styled-components";
import { HEADER_SIZES, mb2 } from "../../css";

export interface HeaderProps {
  size: HeaderSize;
}
type HeaderSize = 1 | 2 | 3 | 4 | 5;

export function Header({ size, children }: PropsWithChildren<HeaderProps>) {
  switch (size) {
    case 1:
      return <StyledH1>{children}</StyledH1>;
    case 2:
      return <StyledH2>{children}</StyledH2>;
    case 3:
      return <StyledH3>{children}</StyledH3>;
    case 4:
      return <StyledH4>{children}</StyledH4>;
    case 5:
      return <StyledH5>{children}</StyledH5>;
  }
}

const StyledH1 = styled.h1`
  font-size: ${HEADER_SIZES[0]};
  ${mb2};
`;

const StyledH2 = styled.h2`
  font-size: ${HEADER_SIZES[1]};
  ${mb2};
`;

const StyledH3 = styled.h3`
  font-size: ${HEADER_SIZES[2]};
  ${mb2};
`;

const StyledH4 = styled.h4`
  font-size: ${HEADER_SIZES[3]};
  ${mb2};
`;

const StyledH5 = styled.h5`
  font-size: ${HEADER_SIZES[4]};
  ${mb2};
`;
