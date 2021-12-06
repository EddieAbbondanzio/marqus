import { fontAwesomeLib } from "./libs/fontAwesome";
import { Layout } from "./components/Layout";
import { render } from "react-dom";
import React, { useState } from "react";
import { State } from "../shared/state";
import { useCommands } from "./io/commands";
import { useShortcuts } from "./io/shortcuts";

(async () => {
  fontAwesomeLib();
  const initialState = await window.rpc("state.load");

  function App() {
    const [state, execute] = useCommands(initialState);
    useShortcuts(state, execute);

    return <Layout>hi</Layout>;
  }

  render(<App />, document.getElementById("app"));
})();
