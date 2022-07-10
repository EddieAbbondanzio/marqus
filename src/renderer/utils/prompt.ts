import { PromptOptions } from "../../shared/ui/prompt";

const { ipc } = window;

export const promptError = async (errorMessage: string): Promise<void> =>
  void ipc("app.promptUser", {
    text: errorMessage,
    buttons: [{ text: "Ok", role: "default" }],
    type: "error",
    title: "Error",
  });

export const promptFatal = async (errorMessage: string): Promise<void> =>
  void ipc("app.promptUser", {
    text: errorMessage,
    buttons: [{ text: "Quit", role: "default" }],
    type: "error",
    title: "Fatal Error",
  });

export const promptConfirmAction = async (
  verb: string,
  name: string
): Promise<boolean> => {
  const opts: PromptOptions<boolean> = {
    text: `Are you sure you want to ${verb} ${name}?`,
    buttons: [
      { text: "Yes", role: "default", value: true },
      { text: "No", role: "cancel", value: false },
    ],
    type: "info",
    title: `Confirm ${verb}`,
  };

  const pickedButton = await ipc("app.promptUser", opts);
  return pickedButton.value as boolean;
};
