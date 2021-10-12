import { IpcPlugin } from "..";
import { PromptUser, PromptOptions, PromptButton } from "./common";

export const promptUser: IpcPlugin<PromptOptions> =
  (sendIpc) => async (opts: PromptOptions) => {
    const button: PromptButton = await sendIpc("promptUser", opts);
    return button;
  };
