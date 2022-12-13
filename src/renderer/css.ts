// TODO: Leave this here for now. It'll function as the default theme. Once
// we're ready to support user defined themes we'll pull it down to main.

import OpenColor from "open-color";
import { css } from "styled-components";

export const THEME = {
  sidebar: {
    hover: OpenColor.gray[8],
    selected: OpenColor.gray[7],
    background: OpenColor.gray[9],
    font: OpenColor.gray[3],
    error: {
      background: OpenColor.red[1],
      font: OpenColor.red[9],
    },
    search: {
      icon: OpenColor.white,
      deleteIcon: OpenColor.red[0],
      background: OpenColor.gray[8],
      font: OpenColor.gray[2],
    },
    input: {
      font: OpenColor.gray[2],
      background: OpenColor.gray[8],
    },
  },
  editor: {
    tabs: {
      background: OpenColor.gray[3],
      border: OpenColor.gray[5],
      hoveredButtonBackground: OpenColor.gray[5],
      hoveredTabBackground: OpenColor.gray[5],
      activeTabBackground: OpenColor.white,
      activeTabFont: OpenColor.gray[9],
      deleteColor: OpenColor.red[7],
      deleteHoverBackground: OpenColor.gray[3],
      scrollbarColor: OpenColor.gray[5],
    },
  },
};

export const HEADER_SIZES = [
  "4rem",
  "3.2rem",
  "2.4rem",
  "2rem",
  "1.6rem",
  "1.4rem",
];

export const rounded = css`
  border-radius: 0.2rem;
`;

export const w100 = css`
  width: 100%;
`;
export const h100 = css`
  height: 100%;
`;
export const mh100 = css`
  min-height: 100%;
`;

export const SPACERS = ["0.25rem", "0.5rem", "1rem", "2rem"];

export const p0 = css`
  padding: 0;
`;
export const p1 = css`
  padding: ${SPACERS[0]};
`;
export const p2 = css`
  padding: ${SPACERS[1]};
`;
export const p3 = css`
  padding: ${SPACERS[2]};
`;
export const p4 = css`
  padding: ${SPACERS[3]};
`;

export const px0 = css`
  padding-left: 0;
  padding-right: 0;
`;
export const px1 = css`
  padding-left: ${SPACERS[0]};
  padding-right: ${SPACERS[0]};
`;
export const px2 = css`
  padding-left: ${SPACERS[1]};
  padding-right: ${SPACERS[1]};
`;
export const px3 = css`
  padding-left: ${SPACERS[2]};
  padding-right: ${SPACERS[2]};
`;
export const px4 = css`
  padding-left: ${SPACERS[3]};
  padding-right: ${SPACERS[3]};
`;

export const py0 = css`
  padding-top: 0;
  padding-bottom: 0;
`;
export const py1 = css`
  padding-top: ${SPACERS[0]};
  padding-bottom: ${SPACERS[0]};
`;
export const py2 = css`
  padding-top: ${SPACERS[1]};
  padding-bottom: ${SPACERS[1]};
`;
export const py3 = css`
  padding-top: ${SPACERS[2]};
  padding-bottom: ${SPACERS[2]};
`;
export const py4 = css`
  padding-top: ${SPACERS[3]};
  padding-bottom: ${SPACERS[3]};
`;

export const pl0 = css`
  padding-left: 0;
`;
export const pl1 = css`
  padding-left: ${SPACERS[0]};
`;
export const pl2 = css`
  padding-left: ${SPACERS[1]};
`;
export const pl3 = css`
  padding-left: ${SPACERS[2]};
`;
export const pl4 = css`
  padding-left: ${SPACERS[3]};
`;

export const pr0 = css`
  padding-right: 0;
`;
export const pr1 = css`
  padding-right: ${SPACERS[0]};
`;
export const pr2 = css`
  padding-right: ${SPACERS[1]};
`;
export const pr3 = css`
  padding-right: ${SPACERS[2]};
`;
export const pr4 = css`
  padding-right: ${SPACERS[3]};
`;

export const pt0 = css`
  padding-top: 0;
`;
export const pt1 = css`
  padding-top: ${SPACERS[0]};
`;
export const pt2 = css`
  padding-top: ${SPACERS[1]};
`;
export const pt3 = css`
  padding-top: ${SPACERS[2]};
`;
export const pt4 = css`
  padding-top: ${SPACERS[3]};
`;

export const pb0 = css`
  padding-bottom: 0;
`;
export const pb1 = css`
  padding-bottom: ${SPACERS[0]};
`;
export const pb2 = css`
  padding-bottom: ${SPACERS[1]};
`;
export const pb3 = css`
  padding-bottom: ${SPACERS[2]};
`;
export const pb4 = css`
  padding-bottom: ${SPACERS[3]};
`;

export const m0 = css`
  margin: 0;
`;
export const m1 = css`
  margin: ${SPACERS[0]};
`;
export const m2 = css`
  margin: ${SPACERS[1]};
`;
export const m3 = css`
  margin: ${SPACERS[2]};
`;
export const m4 = css`
  margin: ${SPACERS[3]};
`;

export const mx0 = css`
  margin-left: 0;
  margin-right: 0;
`;
export const mx1 = css`
  margin-left: ${SPACERS[0]};
  margin-right: ${SPACERS[0]};
`;
export const mx2 = css`
  margin-left: ${SPACERS[1]};
  margin-right: ${SPACERS[1]};
`;
export const mx3 = css`
  margin-left: ${SPACERS[2]};
  margin-right: ${SPACERS[2]};
`;
export const mx4 = css`
  margin-left: ${SPACERS[3]};
  margin-right: ${SPACERS[3]};
`;

export const my0 = css`
  margin-top: 0;
  margin-bottom: 0;
`;
export const my1 = css`
  margin-top: ${SPACERS[0]};
  margin-bottom: ${SPACERS[0]};
`;
export const my2 = css`
  margin-top: ${SPACERS[1]};
  margin-bottom: ${SPACERS[1]};
`;
export const my3 = css`
  margin-top: ${SPACERS[2]};
  margin-bottom: ${SPACERS[2]};
`;
export const my4 = css`
  margin-top: ${SPACERS[3]};
  margin-bottom: ${SPACERS[3]};
`;

export const ml0 = css`
  margin-left: 0;
`;
export const ml1 = css`
  margin-left: ${SPACERS[0]};
`;
export const ml2 = css`
  margin-left: ${SPACERS[1]};
`;
export const ml3 = css`
  margin-left: ${SPACERS[2]};
`;
export const ml4 = css`
  margin-left: ${SPACERS[3]};
`;

export const mr0 = css`
  margin-right: 0;
`;
export const mr1 = css`
  margin-right: ${SPACERS[0]};
`;
export const mr2 = css`
  margin-right: ${SPACERS[1]};
`;
export const mr3 = css`
  margin-right: ${SPACERS[2]};
`;
export const mr4 = css`
  margin-right: ${SPACERS[3]};
`;

export const mt0 = css`
  margin-top: 0;
`;
export const mt1 = css`
  margin-top: ${SPACERS[0]};
`;
export const mt2 = css`
  margin-top: ${SPACERS[1]};
`;
export const mt3 = css`
  margin-top: ${SPACERS[2]};
`;
export const mt4 = css`
  margin-top: ${SPACERS[3]};
`;

export const mb0 = css`
  margin-bottom: 0;
`;
export const mb1 = css`
  margin-bottom: ${SPACERS[0]};
`;
export const mb2 = css`
  margin-bottom: ${SPACERS[1]};
`;
export const mb3 = css`
  margin-bottom: ${SPACERS[2]};
`;
export const mb4 = css`
  margin-bottom: ${SPACERS[3]};
`;
