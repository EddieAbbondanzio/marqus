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
import { Store, StoreListener, useStore } from "./store";
import { Button } from "./components/shared/Button";
import { getNodeEnv } from "../shared/env";
import { InvalidOpError } from "../shared/errors";

const { rpc } = window;
async function main() {
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
    // DEPRECATED!
    const [state, execute, setUI] = useCommands({
      ui,
      shortcuts,
      tags,
      notebooks,
      notes,
    });

    // Pass store down via props
    const store = useStore({
      ui,
      shortcuts,
      tags,
      notebooks,
      notes,
    });

    useShortcuts(store);

    useEffect(() => {
      store.on("sidebar.toggle", toggleSidebar);
      store.on(["sidebar.focus", "editor.focus"], focusSection);

      return () => {
        store.off("sidebar.toggle", toggleSidebar);
        store.off(["sidebar.focus", "editor.focus"], focusSection);
      };
    }, [store.state]);

    return (
      <FocusTracker className="h-100 w-100 is-flex is-flex-row" store={store}>
        {!(store.state.ui.sidebar.hidden ?? false) && (
          <Sidebar
            store={store}
            state={state}
            execute={execute}
            setUI={setUI}
          />
        )}

        <Focusable name="editor">Editor!</Focusable>
      </FocusTracker>
    );
  }

  render(<App />, document.getElementById("app"));
}

// Only render in production, or dev
if (getNodeEnv() !== "test") {
  void main();
}

/*
 * Don't move these to be in Sidebar.tsx. Otherwise the listener will only work
 * when the sidebar is being rendered.
 */
export const toggleSidebar: StoreListener<"sidebar.toggle"> = (_, ctx) => {
  ctx.setUI((prev) => ({
    sidebar: {
      hidden: !(prev.sidebar.hidden ?? false),
    },
  }));
};

export const focusSection: StoreListener<"sidebar.focus" | "editor.focus"> = (
  ev,
  ctx
) => {
  switch (ev.type) {
    case "sidebar.focus":
      ctx.setUI({
        focused: ["sidebar"],
      });
      break;
    case "editor.focus":
      ctx.setUI({
        focused: ["editor"],
      });
      break;
    default:
      throw new InvalidOpError(`Invalid focus event ${ev.type}`);
  }
};
