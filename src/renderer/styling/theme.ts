// TODO: Leave this here for now. It'll function as the default theme. Once
// we're ready to support user defined themes we'll pull it down to main.

import OpenColor from "open-color";

const BORDER = OpenColor.gray[7];

export const THEME = {
  contextMenu: {
    background: OpenColor.gray[0],
    border: BORDER,
  },
  sidebar: {
    background: OpenColor.gray[9],
    inputsBackground: OpenColor.gray[7],
    fontColor: OpenColor.gray[3],
    filter: {},
  },
};
