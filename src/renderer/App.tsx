import { fontAwesomeLib } from "./libs/fontAwesome";
import { render } from "react-dom";
import React, { useState } from "react";
import { useCommands } from "./io/commands";
import { useShortcuts } from "./io/shortcuts";
import { State } from "../shared/domain/state";
import { promptFatal } from "./utils/prompt";
import { Sidebar } from "./components/Sidebar";
import { FocusTracker } from "./components/FocusTracker";
import { Focusable } from "./components/Focusable";

const { rpc } = window;
(async () => {
  fontAwesomeLib();

  let initialState: State;
  try {
    initialState = await rpc("state.load");
  } catch (e) {
    console.log("Fatal Error", e);
    await promptFatal((e as Error).message);
    await rpc("app.quit");
    return;
  }

  function App() {
    const [state, execute, setUI] = useCommands(initialState);
    useShortcuts(state, execute);

    return (
      <FocusTracker
        className="h-100 w-100 is-flex is-flex-row"
        state={state}
        setUI={setUI}
      >
        {!(state.ui.sidebar.hidden ?? false) && (
          <Sidebar state={state} execute={execute} setUI={setUI} />
        )}

        <Focusable name="editor">Editor!</Focusable>
      </FocusTracker>
    );
  }

  render(<App />, document.getElementById("app"));
})();
