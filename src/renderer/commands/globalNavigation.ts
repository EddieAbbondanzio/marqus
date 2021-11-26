import { Command } from "./types";

const focus: Command = async ({ commit, state }) => {
  state.ui.focused = "globalNavigation";
  await commit(state);
};

/**
 * Resize global navigation width.
 * @param newWidth New width string ex: '120px'
 */
const resizeWidth: Command<string> = async ({ commit, state }, newWidth) => {
  if (newWidth == null) {
    throw Error();
  }

  state.ui.globalNavigation.width = newWidth;
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

  state.ui.globalNavigation.scroll = Math.max(newScroll, 0);
  await commit(state);
};

const scrollDown: Command<number> = async (
  { commit, state },
  increment = 30
) => {
  const newScroll = Math.max(state.ui.globalNavigation.scroll + increment, 0);
  state.ui.globalNavigation.scroll = newScroll;

  await commit(state);
};

const scrollUp: Command<number> = async ({ commit, state }, increment = 30) => {
  console.log("SCROLL UP!");
  const newScroll = Math.max(state.ui.globalNavigation.scroll - increment, 0);
  state.ui.globalNavigation.scroll = newScroll;

  await commit(state);
};

export const GLOBAL_NAVIGATION_REGISTRY = {
  focus,
  resizeWidth,
  updateScroll,
  scrollDown,
  scrollUp,
};
