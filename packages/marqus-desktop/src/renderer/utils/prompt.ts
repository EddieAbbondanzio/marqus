import { PromptOptions } from "../../shared/ui/prompt";
import { logger } from "../logger";

const { ipc } = window;

export const promptError = async (errorMessage: string): Promise<void> => {
  await ipc("app.promptUser", {
    text: errorMessage,
    buttons: [{ text: "Ok", role: "default" }],
    type: "error",
    title: "Error",
  });
};

export const promptFatal = async (
  message: string,
  err: Error,
): Promise<void> => {
  // dialog.showMessageBox is used over dialog.showErrorBox because it gives us
  // more customization and supports multiple buttons. dialog.showErrorBox is
  // good for showing errors PRIOR to app being ready but, isn't needed for us
  // since it doesn't work on Linux.
  const button = await ipc("app.promptUser", {
    text: message,
    detail: err.stack,
    buttons: [{ text: "Quit", role: "default" }, { text: "Reload" }],
    type: "error",
    title: "Fatal Error",
  });

  if (button.text === "Quit") {
    await logger.info("Shutting down.");
    await ipc("app.quit");
  } else if (button.text === "Reload") {
    await ipc("app.reload");
  }
};

export const promptConfirmAction = async (
  verb: string,
  name: string,
  detail?: string,
): Promise<boolean> => {
  const opts: PromptOptions<boolean> = {
    text: `Are you sure you want to ${verb} ${name}?`,
    buttons: [
      { text: "Yes", role: "default", value: true },
      { text: "No", role: "cancel", value: false },
    ],
    type: "info",
    title: `Confirm ${verb}`,
    detail,
  };

  const pickedButton = await ipc("app.promptUser", opts);
  return pickedButton.value as boolean;
};
