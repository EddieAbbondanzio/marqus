import { fontAwesomeLib } from "./libs/fontAwesome";
import { Layout } from "./components/Layout";
import { render } from "react-dom";
import React from "react";
import { useCommands } from "./io/commands";
import { useShortcuts } from "./io/shortcuts";
import { useFocusTracking } from "./io/focus";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { State } from "../shared/state";
import { promptFatal } from "./utils/prompt";

const { rpc } = window;
(async () => {
  fontAwesomeLib();
  let initialState: State = await loadInitialState();

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

async function loadInitialState(): Promise<State> {
  try {
    return (await rpc("state.load")) as State;
  } catch (e) {
    await promptFatal((e as Error).message);
    await rpc("app.quit");

    // App will close so this is irrelevant.
    return null!;
  }
}
