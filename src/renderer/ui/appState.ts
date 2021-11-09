import { IpcPlugin, onInitPlugin as onInitPlugin } from "../../shared/ipc";
import * as yup from "yup";

export interface GlobalNavigation {
  width: string;
  scroll: number;
}

export interface AppState {
  globalNavigation: GlobalNavigation;
}

export type AppStateSection = keyof AppState;

/*
 * AppState get / set are intentionally left sync. React function components
 * don't bode well with async plus it's not really needed.
 */

export interface AppStateHandler {
  get(): AppState;
  get(section: AppStateSection): AppState[typeof section];
  set(section: AppStateSection, state: AppState[typeof section]): Promise<void>;
}

let state: AppState = {} as any;

export const appStatePlugin: IpcPlugin<AppStateHandler> = function (sendIpc) {
  const get = (section?: AppStateSection) => {
    return section ? state[section] : (state as any);
  };

  // Set should only be used by commands
  const set = async (
    section: AppStateSection,
    stateSection: AppState[typeof section]
  ) => {
    state[section] = stateSection;

    await sendIpc("appState.save", { state });
  };

  return {
    get,
    set,
  };
};

onInitPlugin(async (sendIpc) => {
  const s = await sendIpc("appState.load");

  // Validate contents
  if (s != null) {
    await appStateSchema.validate(s);
    state = s;
    console.log("Set state");
  }
});

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
