import { IpcPlugin } from "../../shared/ipc/ipc";

export interface GlobalNavigation {
  width: string;
  scroll: number;
}

export interface AppState {
  globalNavigation: GlobalNavigation;
}

interface AppStateHandler {
  load(): Promise<AppState>;
  save(appState: AppState): Promise<void>;
}

export const appStatePlugin: IpcPlugin<AppStateHandler> = function (sendIpc) {
  const load = async () => {
    const state = await sendIpc("loadAppState");
    return state;
  };

  const save = async (state: AppState) => {
    await sendIpc("saveAppState", state);
  };

  return {
    load,
    save,
  };
};
