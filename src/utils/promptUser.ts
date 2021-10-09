import { PromptButton, PromptOptions } from "@/_electron/main/prompt";

export async function promptUser(
  options: PromptOptions
): Promise<PromptButton> {
  const buttons = Array.isArray(options.buttons)
    ? options.buttons
    : [options.buttons];

  if (buttons.length > 1) {
    if (buttons.filter((b) => b.role === "cancel").length > 1) {
      throw Error("Only one cancel button is allowed.");
    }

    if (buttons.filter((b) => b.role === "default").length > 1) {
      throw Error("Only one default button is allowed.");
    }
  }
  window.ipcRenderer.send("rpc", );

  return buttons[0];
  // return buttons[returnVal.response];
}
