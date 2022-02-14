import { fontAwesomeLib } from "./libs/fontAwesome";
import { render } from "react-dom";
import React, { useEffect } from "react";
import { useShortcuts } from "./io/shortcuts";
import { promptFatal } from "./utils/prompt";
import { Sidebar } from "./components/Sidebar";
import { Focusable } from "./components/shared/Focusable";
import { UI } from "./state";
import { Shortcut } from "../shared/domain/shortcut";
import { FocusTracker } from "./components/shared/FocusTracker";
import { Note } from "../shared/domain/note";
import { Tag } from "../shared/domain/tag";
import { Notebook } from "../shared/domain/notebook";
import { StoreListener, useStore } from "./store";
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
    const store = useStore({
      ui,
      shortcuts,
      tags,
      notebooks,
      notes,
    });
    useShortcuts(store);

    useEffect(() => {
      const focusSidebar = () => store.dispatch("focus.push", "sidebar");
      const focusEditor = () => store.dispatch("focus.push", "editor");

      store.on("sidebar.toggle", toggleSidebar);
      store.on("sidebar.focus", focusSidebar);
      store.on("editor.focus", focusEditor);

      store.on("app.inspectElement", inspectElement);
      store.on("app.openDevTools", openDevTools);
      store.on("app.reload", reload);
      store.on("app.toggleFullScreen", toggleFullScreen);
      return () => {
        store.off("sidebar.toggle", toggleSidebar);
        store.off("sidebar.focus", focusSidebar);
        store.off("editor.focus", focusEditor);

        store.off("app.inspectElement", inspectElement);
        store.off("app.openDevTools", openDevTools);
        store.off("app.reload", reload);
        store.off("app.toggleFullScreen", toggleFullScreen);
      };
    }, [store.state]);

    return (
      <FocusTracker className="h-100 w-100 is-flex is-flex-row" store={store}>
        {!(store.state.ui.sidebar.hidden ?? false) && <Sidebar store={store} />}

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

export const openDevTools = () => rpc("app.openDevTools");
export const reload = () => rpc("app.reload");
export const toggleFullScreen = () => rpc("app.toggleFullScreen");
export const inspectElement: StoreListener<"app.inspectElement"> = ({
  value: coord,
}) => rpc("app.inspectElement", coord);
