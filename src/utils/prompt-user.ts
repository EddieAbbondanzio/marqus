import { Dialog } from "electron";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dialog = require("electron").remote.dialog as Dialog;

export interface PromptButton {
  text: string;
  role?: "cancel" | "default";
  value?: any
}

export type PromptType = "none" | "info" | "warning" | "error";

export interface PromptOptions {
  title?: string;
  type?: PromptType,
  text: string,
  buttons: PromptButton | PromptButton[],
}

export async function promptUser(options: PromptOptions): Promise<PromptButton> {
  const buttons = Array.isArray(options.buttons) ? options.buttons : [options.buttons];

  if (buttons.length > 1) {
    if (buttons.filter(b => b.role === "cancel").length > 1) {
      throw Error("Only one cancel button is allowed.");
    }

    if (buttons.filter(b => b.role === "default").length > 1) {
      throw Error("Only one default button is allowed.");
    }
  }

  const returnVal = await dialog.showMessageBox({
    title: options.title,
    type: options.type ?? "info",
    message: options.text,
    buttons: buttons.map(b => b.text)
  });

  return buttons[returnVal.response];
}
