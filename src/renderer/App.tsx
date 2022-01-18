import { fontAwesomeLib } from "./libs/fontAwesome";
import { render } from "react-dom";
import React from "react";
import { useCommands } from "./io/commands";
import { useShortcuts } from "./io/shortcuts";
import { promptFatal } from "./utils/prompt";
import { Sidebar } from "./components/Sidebar";
import { FocusTracker } from "./components/FocusTracker";
import { Focusable } from "./components/Focusable";
import { App } from "../shared/domain/app";
import { Shortcut } from "../shared/domain/valueObjects";
import { tags } from "./services/tags";

const { rpc } = window;
(async () => {
  fontAwesomeLib();

  let previousState: App;
  let shortcuts: Shortcut[] = [];

  try {
    [previousState, shortcuts] = await Promise.all([
      rpc("app.loadPreviousState"),
      rpc("shortcuts.getAll"),
      // We don't listen for returns from the following:
      tags.initialize(),
    ]);
  } catch (e) {
    console.log("Fatal Error", e);
    await promptFatal((e as Error).message);
    await rpc("app.quit");
    return;
  }

  function App() {
    // console.log("App");
    const [app, execute, setUI] = useCommands(previousState);
    useShortcuts(shortcuts, app, execute);

    return (
      <FocusTracker
        className="h-100 w-100 is-flex is-flex-row"
        state={app}
        setUI={setUI}
      >
        {!(app.sidebar.hidden ?? false) && (
          <Sidebar state={app} execute={execute} setUI={setUI} />
        )}

        <Focusable name="editor">Editor!</Focusable>
      </FocusTracker>
    );
  }

  render(<App />, document.getElementById("app"));
})();
