import { IpcPlugin } from "../../shared/ipc";
import { PromptOptions, PromptButton } from "../../shared/ipc/promptUser";

export type PromptUser = (opts: PromptOptions) => Promise<PromptButton>;

export const promptUser: PromptUser = async (opts: PromptOptions) => {
  const button: PromptButton = await window.sendIpc("ui.promptUser", opts);
  return button;
};
