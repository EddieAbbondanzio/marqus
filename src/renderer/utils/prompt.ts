import { PromptOptions, PromptUser } from "../../shared/ui/promptUser";

export const prompt: PromptUser = async (opts: PromptOptions) =>
  window.rpc("app.promptUser", opts);

export const promptError = async (errorMessage: string) =>
  prompt({
    text: errorMessage,
    buttons: [{ text: "Ok", role: "default" }],
    type: "error",
    title: "Error",
  });
