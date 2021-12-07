import { fontAwesomeLib } from "./libs/fontAwesome";
import { Layout } from "./components/Layout";
import { render } from "react-dom";
import React from "react";
import { useCommands } from "./io/commands";
import { useShortcuts } from "./io/shortcuts";
import { useFocusTracking } from "./io/focus";
import { GlobalNavigation } from "./components/GlobalNavigation";

(async () => {
  fontAwesomeLib();
  const initialState = await window.rpc("state.load");
  console.log("init state: ", initialState);

  function App() {
    const [state, execute, setUI] = useCommands(initialState);
    useShortcuts(state, execute);
    useFocusTracking(state, setUI);

    return (
      <Layout>
        <GlobalNavigation state={state} execute={execute} setUI={setUI} />
      </Layout>
    );
  }

  render(<App />, document.getElementById("app"));
})();
