export type PromptButtonRole = "cancel" | "default";

export interface PromptButton {
  text: string;
  role?: PromptButtonRole;
  value?: any;
}

export type PromptType = "none" | "info" | "warning" | "error";

export interface PromptOptions {
  title?: string;
  type?: PromptType;
  text: string;
  buttons: PromptButton[];
}

export type PromptUser = (opts: PromptOptions) => Promise<PromptButton>;
