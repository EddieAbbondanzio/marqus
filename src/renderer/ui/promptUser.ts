import {
  PromptOptions,
  PromptButton,
  PromptUser,
} from "../../shared/ipc/promptUser";

export const promptUser: PromptUser = async (opts: PromptOptions) => {
  const button: PromptButton = await window.sendIpc("ui.promptUser", opts);
  return button;
};
