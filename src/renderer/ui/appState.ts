import { IpcPlugin } from "../../shared/ipc";
import * as yup from "yup";
import { useAsync } from "react-async-hook";
import { useState } from "react";
import { px } from "../../shared/dom/units";

export interface GlobalNavigation {
  width: string;
  scroll: number;
}

export interface AppState {
  globalNavigation: GlobalNavigation;
}

export const APP_STATE_FILE = "appstate.json";

export function useAppState(): [AppState, any] {
  const [state, setState] = useState({
    globalNavigation: {
      width: px(300),
      scroll: 0,
    },
  } as AppState);

  // Load state from file (if any)
  useAsync(async () => {
    const appState = await window.config.loadConfig({ name: APP_STATE_FILE });

    if (appState != null) {
      await appStateSchema.validate(appState);
      setState(appState);
      console.log("set state: ", appState);
    }
  }, []);

  return [state, setState];
}

const appStateSchema = yup.object().shape({
  globalNavigation: yup.object().shape({
    width: yup.string().required(),
    scroll: yup.number().required().min(0),
  }),
});
