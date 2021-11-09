import { Command } from "../types";

export const resizeWidth: Command<string> = async (state, newWidth: string) => {
  state.globalNavigation.width = newWidth;

  await window.appState.set(state);
};
