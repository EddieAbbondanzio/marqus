export type NodeEnv = "development" | "production";
export const getNodeEnv = () => process.env.NODE_ENV as NodeEnv;

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
