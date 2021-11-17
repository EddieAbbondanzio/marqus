import * as yup from "yup";
import { useAsync } from "react-async-hook";
import { useState } from "react";
import { px } from "../../shared/dom/units";

const { rpc } = window;

export interface GlobalNavigation {
  width: string;
  scroll: number;
}

export interface AppState {
  globalNavigation: GlobalNavigation;
}

export type SetAppState = (appState: AppState) => Promise<void>;

export const APP_STATE_FILE = "appstate.json";

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
    const appState = await rpc("config.load", { name: APP_STATE_FILE });

    if (appState != null) {
      await appStateSchema.validate(appState);
      setState(appState);
    }
  }, []);

  const setStateAndPersist: SetAppState = async (appState: AppState) => {
    await rpc("config.save", { name: APP_STATE_FILE, content: appState });
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
