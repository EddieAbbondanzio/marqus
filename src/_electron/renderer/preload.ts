import { generateId } from "@/utils";
import { contextBridge, ipcRenderer } from "electron";
import { IpcType, PromptButton, PromptOptions, PromptUser } from "..";

export interface ExposedPromise {
  resolve: (val: any) => unknown;
  reject: (err: any) => unknown;
}

const promises: { [id: string]: ExposedPromise } = {};

/*
 * Listen on render for main responses.
 */
ipcRenderer.on("send", async (ev, arg) => {
  if (isError(arg)) {
    throw Error(arg.error);
  }

  const { id, value } = arg;

  const p = promises[id];
  if (p == null) {
    return;
  }

  // eslint-disable-next-line no-prototype-builtins
  if (isError(arg)) {
    p.reject(arg.error);
  } else {
    p.resolve(value);
  }
});

/**
 * Send an ipc to the main thread.
 * @param type String of the type
 * @param value Payload.
 * @returns The response the main thread gave
 */
export async function sendIpc<T>(type: IpcType, value: T): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = generateId();
    promises[id] = { resolve, reject };

    ipcRenderer.send("send", {
      id,
      type,
      value,
    });
  });
}

const promptUser: PromptUser = async (opts: PromptOptions) => {
  const button: PromptButton = await sendIpc("prompt", opts);
  return button;
};

contextBridge.exposeInMainWorld("promptUser", promptUser);

export function isError(
  err: Record<string, unknown>
): err is { error: string } {
  // eslint-disable-next-line no-prototype-builtins
  return err.hasOwnProperty("error");
}

console.log("preloaded");
