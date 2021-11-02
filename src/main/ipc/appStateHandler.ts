import { IpcHandler } from "../../shared/ipc/ipc";
import { generateFullPath, readFile, writeFile } from "../fileSystem";

export const APP_STATE_FILE = "appstate.json";

export const appStateLoader: IpcHandler<void> = async () => {
  const path = generateFullPath(APP_STATE_FILE);
  const state = await readFile(path, "json");
  return state;
};

export const appStateSaver: IpcHandler<{}> = async (state: {}) => {
  const path = generateFullPath(APP_STATE_FILE);
  await writeFile(path, state, "json");
};
