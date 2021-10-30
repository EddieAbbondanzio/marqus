import { IpcPlugin } from "../../common/ipc/ipc";
import {
  PromptUser,
  PromptOptions,
  PromptButton,
} from "../../common/ipc/promptUser";

export const promptUserPlugin: IpcPlugin<PromptUser> =
  (sendIpc) => async (opts: PromptOptions) => {
    const button: PromptButton = await sendIpc("promptUser", opts);
    return button;
  };
