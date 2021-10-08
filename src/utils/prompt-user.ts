import { Dialog } from "electron";
import { isPromise } from "./async";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dialog = require("electron").remote.dialog as Dialog;

export interface Button {
  text: string;
  click?: () => any;
  role?: "cancel" | "default"
}

export type PromptType = "none" | "info" | "warning" | "error";

export interface PromptOptions {
  title?: string;
  type?: PromptType,
  text: string,
  buttons: Button | Button[],
}

export async function promptUser(options: PromptOptions) {
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

  const selectedButton = buttons[returnVal.response];

  if (selectedButton.click != null) {
    const res = selectedButton.click();

    if (isPromise(res)) {
      // Useful for try / catch
      return await res;
    }

    return res;
  }
}
