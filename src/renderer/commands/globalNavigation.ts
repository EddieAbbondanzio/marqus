import { Command } from "./types";

/**
 * Resize global navigation width.
 * @param newWidth New width string ex: '120px'
 */
const resizeWidth: Command<string> = async (
  { commit, state },
  newWidth: string
) => {
  state.globalNavigation.width = newWidth;
  await commit(state);
};

/**
 * Update the current scroll position.
 * @param newScroll The new scroll position.
 */
const updateScroll: Command<number> = async (
  { commit, state },
  newScroll: number
) => {
  if (newScroll < 0) {
    throw Error(`Invalid scroll position. Scroll was negative: ${newScroll}`);
  }

  state.globalNavigation.scroll = newScroll;
  await commit(state);
};

export const GLOBAL_NAVIGATION_REGISTRY = {
  resizeWidth,
  updateScroll,
};
