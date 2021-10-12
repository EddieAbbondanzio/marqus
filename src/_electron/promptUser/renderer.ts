import { BridgedWindow } from "..";
import { PromptUser, PromptOptions, PromptButton } from "./common";

export const promptUser: PromptUser = async (opts: PromptOptions) => {
  const { sendIpc } = window as any as BridgedWindow;

  const button: PromptButton = await sendIpc("promptUser", opts);
  return button;
};
