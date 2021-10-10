import { sendIpc } from "../preload";
import { PromptUser, PromptOptions, PromptButton } from "./common";

export const promptUser: PromptUser = async (opts: PromptOptions) => {
  const button: PromptButton = await sendIpc("promptUser", opts);
  return button;
};
