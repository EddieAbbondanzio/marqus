import { fontAwesomeLib } from "./libs/fontAwesome";
import { render } from "react-dom";
import React, { useState } from "react";
import { useCommands } from "./io/commands";
import { useShortcuts } from "./io/shortcuts";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { State } from "../shared/state";
import { promptFatal } from "./utils/prompt";
import { FocusTracker } from "./components/shared/FocusTracker";
import { Focusable } from "./components/shared/Focusable";
import { px } from "../shared/dom";

const { rpc } = window;
(async () => {
  fontAwesomeLib();

  let initialState: State;
  try {
    initialState = (await rpc("state.load")) as State;
  } catch (e) {
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
        <GlobalNavigation state={state} execute={execute} setUI={setUI} />
        <Focusable name="localNavigation">
          <div
            style={{
              height: px(300),
              width: px(300),
              backgroundColor: "red",
            }}
          >
            &nbsp; LOCAL
          </div>
        </Focusable>
      </FocusTracker>
    );
  }

  render(<App />, document.getElementById("app"));
})();
