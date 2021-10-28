import { IpcPlugin } from "../../src/common/ipc";
import {
  PromptUser,
  PromptOptions,
  PromptButton,
} from "../../src/common/promptUser";

export const promptUserPlugin: IpcPlugin<PromptUser> =
  (sendIpc) => async (opts: PromptOptions) => {
    const button: PromptButton = await sendIpc("promptUser", opts);
    return button;
  };
