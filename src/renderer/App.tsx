import { fontAwesomeLib } from "./libs/fontAwesome";
import { Layout } from "./components/Layout";
import { render } from "react-dom";
import React from "react";
import { useCommands } from "./io/commands";
import { useShortcuts } from "./io/shortcuts";
import { useFocusTracking } from "./io/focus";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { State } from "../shared/state";
import { promptError } from "./utils/prompt";

(async () => {
  fontAwesomeLib();

  let initialState: State;
  try {
    initialState = await window.rpc("state.load");
  } catch (e) {
    promptError((e as Error).message);
  }

  function App() {
    const [state, execute, setUI] = useCommands(initialState);
    useShortcuts(state, execute);
    useFocusTracking(state, setUI);

    return (
      <Layout>
        <GlobalNavigation state={state} execute={execute} />
      </Layout>
    );
  }

  render(<App />, document.getElementById("app"));
})();
