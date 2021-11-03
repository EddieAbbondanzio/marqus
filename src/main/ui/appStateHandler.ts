import { IpcHandler } from "../../shared/ipc/ipc";
import { fileExists, readFile, writeFile } from "../fileSystem";

export const APP_STATE_FILE = "appstate.json";

export const appStateLoader: IpcHandler<void> = async () => {
  if (!fileExists(APP_STATE_FILE)) {
    return null;
  }

  const state = await readFile(APP_STATE_FILE, "json");
  return state;
};

export const appStateSaver: IpcHandler<unknown> = async (state: unknown) => {
  await writeFile(APP_STATE_FILE, state, "json");
};
