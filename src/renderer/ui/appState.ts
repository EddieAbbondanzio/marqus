import * as yup from "yup";
import { useAsync } from "react-async-hook";
import { useState } from "react";
import { px } from "../../shared/dom/units";
import { State } from "../../shared/domain/state";

const { rpc } = window;

export function useAppState(): [State] {
  const [state, setState] = useState({
    cursor: "auto",
    globalNavigation: {
      width: px(300),
      scroll: 0,
    },
  } as State);

  // Load state from file (if any)
  useAsync(async () => {
    // const appState =
    await rpc("tags.getAll");
    await rpc("tags.create", { name: "foo" });

    // if (appState != null) {
    //   await appStateSchema.validate(appState);
    //   setState(appState);
    // }
  }, []);

  const setStateAndPersist: SetAppState = async (appState: State) => {
    // await rpc("config.save", { name: APP_STATE_FILE, content: appState });
    // setState(appState);
  };

  return [state, setStateAndPersist];
}

const appStateSchema = yup.object().shape({
  globalNavigation: yup.object().shape({
    width: yup.string().required(),
    scroll: yup.number().required().min(0),
  }),
});
