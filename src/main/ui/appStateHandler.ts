import { AppStateIpcType, IpcHandler } from "../../shared/ipc/ipc";
import { fileExists, readFile, writeFile } from "../fileSystem";

export const APP_STATE_FILE = "appstate.json";

const load: IpcHandler<void> = async () => {
  if (!fileExists(APP_STATE_FILE)) {
    return null;
  }

  const state = await readFile(APP_STATE_FILE, "json");
  return state;
};

const save: IpcHandler<unknown> = async (state: unknown) => {
  await writeFile(APP_STATE_FILE, state, "json");
};

export const appStateHandlers: Record<AppStateIpcType, IpcHandler<any>> = {
  "appState.load": load,
  "appState.save": save,
};
