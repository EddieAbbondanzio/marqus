import { fontAwesomeLib } from "./libs/fontAwesome";
import { Layout } from "./components/Layout";
import { render } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { useCommands } from "./io/commands";
import { useShortcuts } from "./io/shortcuts";
import { useFocusTracking } from "./io/focus";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { State } from "../shared/state";
import { promptFatal } from "./utils/prompt";
import { Input } from "./components/shared/Input";
import * as yup from "yup";

const { rpc } = window;
(async () => {
  fontAwesomeLib();

  let initialState: State;
  try {
    initialState = await rpc("state.load");
  } catch (e) {
    const button = await promptFatal((e as Error).message);

    if (button.text === "Quit") {
      await rpc("app.quit");
    }
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
