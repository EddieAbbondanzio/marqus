import { IpcPlugin } from "../../shared/ipc";
import * as yup from "yup";
import { px } from "../../shared/dom/units";

export interface GlobalNavigation {
  width: string;
  scroll: number;
}

export interface AppState {
  globalNavigation: GlobalNavigation;
}

export type AppStateSection = keyof AppState;

export interface AppStateHandler {
  load<Section extends keyof AppState, State extends AppState[Section]>(
    section: Section,
    defaultState: State
  ): Promise<State>;
  save(
    section: AppStateSection,
    state: AppState[typeof section]
  ): Promise<void>;
}

export const appStatePlugin: IpcPlugin<AppStateHandler> = function (sendIpc) {
  const load = async <
    Section extends keyof AppState,
    State extends AppState[Section]
  >(
    section: Section,
    defaultState: State
  ) => {
    const state = await sendIpc("appState.load", { section });

    // Validate contents
    if (state != null) {
      await appStateSchema.validate(state);
    }

    return state ?? defaultState;
  };

  const save = async (
    section: AppStateSection,
    state: AppState[typeof section]
  ) => {
    await sendIpc("appState.save", { section, state });
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

declare global {
  const AppState: AppStateHandler;
}
