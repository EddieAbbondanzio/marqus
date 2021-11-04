import { debounce, initial, memoize } from "lodash";
import { AppStateIpcType, IpcHandler } from "../../shared/ipc";
import { fileExists, readFile, writeFile } from "../fileSystem";

export const APP_STATE_FILE = "appstate.json";

let loadedState: Record<string, unknown> | undefined;
let wasInitialized = false;

const _init = async () => {
  const res = (await readFile(APP_STATE_FILE, "json")) as Record<
    string,
    unknown
  >;
  wasInitialized = true;

  return res;
};
/**
 * Update is debounced so we don't over do saving to file.
 */
const _update = debounce(async (state) => {
  await writeFile(APP_STATE_FILE, state, "json");
}, 1000);

const load: IpcHandler<{ section: string }> = async ({ section }) => {
  if (!fileExists(APP_STATE_FILE)) {
    return null;
  }

  if (!wasInitialized) {
    loadedState = await _init();
  }

  /**
   * Type safety is not a concern here. The main thread won't actually know
   * anything about the file since it's all renderer thread specific.
   */

  return loadedState![section];
};

const save: IpcHandler<{ section: string; state: unknown }> = async ({
  section,
  state,
}) => {
  if (!wasInitialized) {
    loadedState = await _init();
  }

  // Apply update to state, and save off newest version to file.
  loadedState![section] = state;
  await _update(loadedState);
  console.log(loadedState);
};

export const appStateHandlers: Record<AppStateIpcType, IpcHandler<any>> = {
  "appState.load": load,
  "appState.save": save,
};
