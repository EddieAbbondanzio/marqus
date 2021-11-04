import { IpcPlugin } from "../../shared/ipc";
import {
  PromptUser,
  PromptOptions,
  PromptButton,
} from "../../shared/ui/promptUser";

export const promptUserPlugin: IpcPlugin<PromptUser> =
  (sendIpc) => async (opts: PromptOptions) => {
    const button: PromptButton = await sendIpc("ui.promptUser", opts);
    return button;
  };

declare const promptUser: PromptUser;
