import { IpcPlugin } from "../../shared/ipc/ipc";
import {
  PromptUser,
  PromptOptions,
  PromptButton,
} from "../../shared/ipc/promptUser";

export const promptUserPlugin: IpcPlugin<PromptUser> =
  (sendIpc) => async (opts: PromptOptions) => {
    const button: PromptButton = await sendIpc("promptUser", opts);
    return button;
  };

declare const promptUser: PromptUser;
