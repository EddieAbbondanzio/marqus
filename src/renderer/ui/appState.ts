import { IpcPlugin } from "../../shared/ipc/ipc";
import * as yup from "yup";
import { px } from "../../shared/dom/units";

export interface GlobalNavigation {
  width: string;
  scroll: number;
}

export interface AppState {
  globalNavigation: GlobalNavigation;
}

export interface AppStateHandler {
  load(): Promise<AppState>;
  save(appState: AppState): Promise<void>;
}

export const appStatePlugin: IpcPlugin<AppStateHandler> = function (sendIpc) {
  const load = async () => {
    const state = await sendIpc("appState.load");

    // Validate contents
    if (state != null) {
      await appStateSchema.validate(state);
    }

    return (
      state ??
      ({
        globalNavigation: {
          width: px(300),
          scroll: 0,
        },
      } as AppState)
    );
  };

  const save = async (state: AppState) => {
    await sendIpc("appState.save", state);
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
  const appState: AppStateHandler;
}
