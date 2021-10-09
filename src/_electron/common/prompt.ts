export interface PromptButton {
  text: string;
  role?: "cancel" | "default";
  value?: any;
}

export type PromptType = "none" | "info" | "warning" | "error";

export interface PromptOptions {
  title?: string;
  type?: PromptType;
  text: string;
  buttons: PromptButton[];
}
