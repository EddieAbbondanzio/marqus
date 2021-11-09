import { Command } from "../types";

/**
 * Resize global navigation width.
 * @param newWidth New width string ex: '120px'
 */
export const resizeWidth: Command<string> = async (
  { commit, state },
  newWidth: string
) => {
  state.globalNavigation.width = newWidth;
  await commit(state);
};
