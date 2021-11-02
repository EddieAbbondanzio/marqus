import { IpcPlugin } from "../../shared/ipc/ipc";
import * as yup from "yup";

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

    // Throws if invalid
    await appStateSchema.validate(state);

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

const appStateSchema = yup.object().shape({
  globalNavigation: yup.object().shape({
    width: yup.string().required(),
    scroll: yup.number().required().min(0),
  }),
});
