import { dialog } from "electron";
import { PromptOptions } from "../common/prompt";
import { RpcHandler, RpcParams } from "./rpc";



export const promptHandler: RpcHandler<PromptOptions> = (opts) => {
    const returnVal = await dialog.showMessageBox({
      title: opts.value,
      type: opts.type ?? "info",
      message: opts.text,
      buttons: opts.buttons.map((b) => b.text),
    });

    // Return back selected button's index
    ev.sender.send("prompt", returnVal);
  });
};
