import { IpcPlugin } from "../../shared/ipc";
import * as yup from "yup";
import { useAsync } from "react-async-hook";
import { useState } from "react";
import { px } from "../../shared/dom/units";
import { CursorIcon } from "./cursor";

export interface GlobalNavigation {
  width: string;
  scroll: number;
}

export interface AppState {
  globalNavigation: GlobalNavigation;
}

export type SetAppState = (appState: AppState) => Promise<void>;

export const APP_STATE_FILE = "appstatde.json";

export function useAppState(): [AppState, any] {
  const [state, setState] = useState({
    cursor: "auto",
    globalNavigation: {
      width: px(300),
      scroll: 0,
    },
  } as AppState);

  // Load state from file (if any)
  useAsync(async () => {
    console.log("load app state");
    const appState = await window.config.loadConfig({ name: APP_STATE_FILE });

    if (appState != null) {
      await appStateSchema.validate(appState);
      setState(appState);
    }
  }, []);

  const setStateAndPersist: SetAppState = async (appState: AppState) => {
    await window.config.saveConfig({ name: APP_STATE_FILE, content: appState });
    setState(appState);
  };

  return [state, setStateAndPersist];
}

const appStateSchema = yup.object().shape({
  globalNavigation: yup.object().shape({
    width: yup.string().required(),
    scroll: yup.number().required().min(0),
  }),
});
