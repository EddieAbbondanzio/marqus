import { fontAwesomeLib } from "./libs/fontAwesome";
import { render } from "react-dom";
import React, { useEffect } from "react";
import { useShortcuts } from "./io/shortcuts";
import { promptFatal } from "./utils/prompt";
import { Sidebar } from "./components/Sidebar";
import { Focusable } from "./components/shared/Focusable";
import { Section, UI } from "./state";
import { Shortcut } from "../shared/domain/shortcut";
import { Note } from "../shared/domain/note";
import { Tag } from "../shared/domain/tag";
import { Notebook } from "../shared/domain/notebook";
import { StoreListener, useStore } from "./store";
import { getNodeEnv } from "../shared/env";
import { head, isEmpty, isEqual } from "lodash";

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
    console.error("Fatal Error", e);
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
      store.on("sidebar.toggle", toggleSidebar);

      store.on("app.inspectElement", inspectElement);
      store.on("app.openDevTools", openDevTools);
      store.on("app.reload", reload);
      store.on("app.toggleFullScreen", toggleFullScreen);

      store.on("focus.push", push);
      store.on("focus.pop", pop);
      return () => {
        store.off("sidebar.toggle", toggleSidebar);

        store.off("app.inspectElement", inspectElement);
        store.off("app.openDevTools", openDevTools);
        store.off("app.reload", reload);
        store.off("app.toggleFullScreen", toggleFullScreen);

        store.off("focus.push", push);
        store.off("focus.pop", pop);
      };
    }, [store.state]);

    return (
      <div className="h-100 w-100 is-flex is-flex-row">
        {!(store.state.ui.sidebar.hidden ?? false) && <Sidebar store={store} />}

        <Focusable store={store} name="editor">
          Editor!
        </Focusable>
      </div>
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

export const push: StoreListener<"focus.push"> = ({ value: next }, ctx) => {
  let previous: Section | undefined;
  const state = ctx.getState();
  if (isEqual(state.ui.focused, [next])) {
    return;
  }

  ctx.setUI((s) => {
    const focused = [next];
    if (s.focused != null && s.focused !== focused) {
      previous = head(s.focused)!;
      focused.push(previous);
    }

    return {
      focused,
    };
  });
};

export const pop: StoreListener<"focus.pop"> = (_, ctx) => {
  ctx.setUI((s) => {
    if (isEmpty(s.focused)) {
      return s;
    }

    return {
      focused: [],
    };
  });
};
