import { PromptButton, PromptOptions, PromptUser } from "..";
import { sendIpc } from "./preload";

export const promptUser: PromptUser = async (opts: PromptOptions) => {
  const button: PromptButton = await sendIpc("promptUser", opts);
  return button;
};
