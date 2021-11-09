import { Command } from "../types";

export const updateScroll: Command<number> = async (
  { commit, state },
  newScroll: number
) => {
  if (newScroll < 0) {
    throw Error(`Invalid scroll position. Scroll was negative: ${newScroll}`);
  }

  state.globalNavigation.scroll = newScroll;
  await commit(state);
};
