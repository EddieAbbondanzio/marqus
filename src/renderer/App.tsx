import { fontAwesomeLib } from "./libs/fontAwesome";
import { render } from "react-dom";
import React, { useContext, useEffect } from "react";
import { useCommands } from "./io/commands";
import { useShortcuts } from "./io/shortcuts";
import { promptFatal } from "./utils/prompt";
import { Sidebar } from "./components/Sidebar";
import { FocusTracker } from "./components/FocusTracker";
import { Focusable } from "./components/Focusable";
import { UI } from "../shared/domain/state";
import { Shortcut } from "../shared/domain/valueObjects";
import { Note, Tag } from "../shared/domain/entities";
import { PubSub, PubSubContext } from "./components/PubSub";

const { rpc } = window;
(async () => {
  fontAwesomeLib();

  let ui: UI;
  let shortcuts: Shortcut[] = [];
  let tags: Tag[] = [];
  let notes: Note[] = [];

  try {
    [ui, shortcuts, tags, notes] = await Promise.all([
      rpc("app.loadPreviousUIState"),
      rpc("shortcuts.getAll"),
      rpc("tags.getAll"),
      rpc("notes.getAll"),
    ]);
  } catch (e) {
    console.log("Fatal Error", e);
    await promptFatal((e as Error).message);
    await rpc("app.quit");
    return;
  }

  function App() {
    const { publish } = useContext(PubSubContext);
    const [state, execute, setUI] = useCommands(
      {
        ui,
        shortcuts,
        tags,
        notebooks: [],
        notes,
      },
      publish
    );
    useShortcuts(shortcuts, state, execute);

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

  render(
    <PubSub>
      <App />
    </PubSub>,
    document.getElementById("app")
  );
})();
