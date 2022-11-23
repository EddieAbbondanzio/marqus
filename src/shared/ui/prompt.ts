export type PromptButtonRole = "cancel" | "default";

export interface PromptButton<T> {
  text: string;
  role?: PromptButtonRole;
  value?: T;
}

export type PromptType = "none" | "info" | "warning" | "error";

export interface PromptOptions<T> {
  title?: string;
  type?: PromptType;
  text: string;
  detail?: string;
  buttons: PromptButton<T>[];
}

export type PromptUser<T> = (
  opts: PromptOptions<T>,
) => Promise<PromptButton<T>>;
