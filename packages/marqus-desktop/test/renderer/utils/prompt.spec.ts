import { promptFatal } from "../../../src/renderer/utils/prompt";

jest.mock("../../../src/renderer/logger");

test("promptFatal", async () => {
  const err = {
    message: "error-message",
    stack: "stack",
  };

  // Quit
  ((window as any).ipc as jest.Mock).mockResolvedValueOnce({ text: "Quit" });
  await promptFatal("Something unexpected occurred.", err as Error);

  expect((window as any).ipc).toHaveBeenCalledWith("app.promptUser", {
    title: "Fatal Error",
    buttons: [{ text: "Quit", role: "default" }, { text: "Reload" }],
    text: "Something unexpected occurred.",
    detail: err.stack,
    type: "error",
  });

  expect((window as any).ipc).toHaveBeenCalledWith("app.quit");
  ((window as any).ipc as jest.Mock).mockReset();

  // Reload
  ((window as any).ipc as jest.Mock).mockResolvedValueOnce({ text: "Reload" });
  await promptFatal("Something unexpected occurred.", err as Error);

  expect((window as any).ipc).toHaveBeenCalledWith("app.promptUser", {
    title: "Fatal Error",
    buttons: [{ text: "Quit", role: "default" }, { text: "Reload" }],
    text: "Something unexpected occurred.",
    detail: err.stack,
    type: "error",
  });

  expect((window as any).ipc).toHaveBeenCalledWith("app.reload");
});
