import { IpcPlugin } from "../../shared/ipc";
import * as yup from "yup";

export interface GlobalNavigation {
  width: string;
  scroll: number;
}

export interface AppState {
  globalNavigation: GlobalNavigation;
}

/*
 * AppState get / set are intentionally left sync. React function components
 * don't bode well with async plus it's not really needed.
 */

export interface AppStateHandler {
  get(): AppState;
  set(state: AppState): Promise<void>;
}

export const APP_STATE_FILE = "appstate.json";

export const appStatePlugin: IpcPlugin<AppStateHandler> = function ({
  sendIpc,
  onInstall: onInit,
}) {
  let state: AppState = {} as any;

  onInit(async () => {
    const s = await sendIpc("config.load", { name: APP_STATE_FILE });

    // Validate contents
    if (s != null) {
      await appStateSchema.validate(s);
      state = s;
      console.log("Set state");
    }
  });

  // Read side is intentionally sync to make it easier to work with
  const get = () => state;

  // Set should only be used by commands
  const set = async (s: AppState) => {
    state = s;
    await sendIpc("config.save", { name: APP_STATE_FILE, content: state });
  };

  return {
    get,
    set,
  };
};

const appStateSchema = yup.object().shape({
  globalNavigation: yup.object().shape({
    width: yup.string().required(),
    scroll: yup.number().required().min(0),
  }),
});

declare global {
  interface Window {
    appState: AppStateHandler;
  }
}
