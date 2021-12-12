import { PromptOptions, PromptUser } from "../../shared/prompt";

export const prompt: PromptUser = async (opts: PromptOptions) =>
  window.rpc("app.promptUser", opts);

export const promptError = async (errorMessage: string) =>
  prompt({
    text: errorMessage,
    buttons: [{ text: "Ok", role: "default" }],
    type: "error",
    title: "Error",
  });

export const promptFatal = async (errorMessage: string) =>
  prompt({
    text: errorMessage,
    buttons: [{ text: "Quit", role: "default" }],
    type: "error",
    title: "Fatal Error",
  });

export const promptConfirmAction = async (verb: string, name: string) =>
  prompt({
    text: `Are you sure you want to ${verb} ${name}?`,
    buttons: [
      { text: "Yes", role: "default" },
      { text: "No", role: "cancel" },
    ],
    type: "info",
    title: `Confirm ${verb}`,
  });
