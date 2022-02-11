import { fontAwesomeLib } from "./libs/fontAwesome";
import { render } from "react-dom";
import React, { useEffect } from "react";
import { useCommands } from "./io/commands";
import { useShortcuts } from "./io/shortcuts";
import { promptFatal } from "./utils/prompt";
import { Sidebar } from "./components/Sidebar";
import { Focusable } from "./components/shared/Focusable";
import { UI } from "./store/state";
import { Shortcut } from "../shared/domain/shortcut";
import { FocusTracker } from "./components/shared/FocusTracker";
import { Note } from "../shared/domain/note";
import { Tag } from "../shared/domain/tag";
import { Notebook } from "../shared/domain/notebook";
import { Store, useStore } from "./store";
import { Button } from "./components/shared/Button";

const { rpc } = window;
(async () => {
  fontAwesomeLib();

  let ui: UI;
  let shortcuts: Shortcut[] = [];
  let tags: Tag[] = [];
  let notebooks: Notebook[] = [];
  let notes: Note[] = [];

  try {
    [ui, shortcuts, tags, notebooks, notes] = await Promise.all([
      rpc("app.loadPreviousUIState"),
      rpc("shortcuts.getAll"),
      rpc("tags.getAll"),
      rpc("notebooks.getAll"),
      rpc("notes.getAll"),
    ]);
  } catch (e) {
    console.log("Fatal Error", e);
    await promptFatal((e as Error).message);
    rpc("app.quit");
    return;
  }

  function App() {
    const [state, execute, setUI] = useCommands({
      ui,
      shortcuts,
      tags,
      notebooks,
      notes,
    });
    useShortcuts(shortcuts, state, execute);

    // Pass store down via props
    const store = useStore({
      ui,
      shortcuts,
      tags,
      notebooks,
      notes,
    });

    store.dispatch("sidebar.toggle");

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
