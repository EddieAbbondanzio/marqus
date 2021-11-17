import { Command } from "./types";

/**
 * Resize global navigation width.
 * @param newWidth New width string ex: '120px'
 */
const resizeWidth: Command<string> = async ({ commit, state }, newWidth) => {
  if (newWidth == null) {
    throw Error();
  }

  state.globalNavigation.width = newWidth;
  await commit(state);
};

/**
 * Update the current scroll position.
 * @param newScroll The new scroll position.
 */
const updateScroll: Command<number> = async ({ commit, state }, newScroll) => {
  if (newScroll == null) {
    throw Error();
  }

  state.globalNavigation.scroll = Math.max(newScroll, 0);
  await commit(state);
};

const scrollDown: Command<number> = async (
  { commit, state },
  increment = 30
) => {
  const newScroll = Math.max(state.globalNavigation.scroll + increment, 0);
  state.globalNavigation.scroll = newScroll;

  await commit(state);
};

const scrollUp: Command<number> = async ({ commit, state }, increment = 30) => {
  const newScroll = Math.max(state.globalNavigation.scroll - increment, 0);
  state.globalNavigation.scroll = newScroll;

  await commit(state);
};

export const GLOBAL_NAVIGATION_REGISTRY = {
  resizeWidth,
  updateScroll,
  scrollDown,
  scrollUp,
};
