import { IpcPlugin } from "../../shared/ipc";
import { PromptOptions, PromptButton } from "../../shared/ipc/promptUser";

export type PromptUser = (opts: PromptOptions) => Promise<PromptButton>;

export const promptUserPlugin: IpcPlugin<PromptUser> =
  ({ sendIpc }) =>
  async (opts: PromptOptions) => {
    const button: PromptButton = await sendIpc("ui.promptUser", opts);
    return button;
  };

declare const promptUser: PromptUser;
