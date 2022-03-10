export const isDevelopment = () => process.env.NODE_ENV === "development";
export const isTest = () => process.env.NODE_ENV === "test";
export const isProduction = () => process.env.NODE_ENV === "production";

export type ProcessType = "main" | "renderer";
export const getProcessType = (): ProcessType => {
  /*
   * process will be null when running in renderer due.
   * (typeof process === "undefined") is used because process == null
   * will throw an error
   */
  if (typeof process === "undefined") {
    return "renderer";
  }

  // No process type means we are running in node.js
  if (process.type == null) {
    return "main";
  }

  return process.type === "renderer" ? "renderer" : "main";
};
