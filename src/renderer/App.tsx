import { fontAwesomeLib } from "./libs/fontAwesome";
import { Layout } from "./components/Layout";
import { render } from "react-dom";
import React, { Reducer, useReducer } from "react";
import { Action, Command, CommandRegistry, useCommands } from "./io/commands";
import { sleep } from "../shared/utils/sleep";

export const appRegistry: CommandRegistry = {
  openDevTools: async () => window.rpc("ui.openDevTools"),
  reload: async () => window.rpc("ui.reload"),
  toggleFullScreen: async () => window.rpc("ui.toggleFullScreen"),
};

(async () => {
  fontAwesomeLib();

  function App() {
    const [state, execute] = useCommands(() => ({}), appRegistry, {});

    return <Layout>hi</Layout>;
  }

  render(<App />, document.getElementById("app"));
})();
