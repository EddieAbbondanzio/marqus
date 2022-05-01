import { render } from "react-dom";
import React, { useEffect } from "react";
import { useShortcuts } from "./io/shortcuts";
import { promptFatal } from "./utils/prompt";
import { Sidebar } from "./components/Sidebar";
import { useFocusTracking } from "./components/shared/Focusable";
import { Section, UI } from "../shared/domain/ui";
import { Shortcut } from "../shared/domain/shortcut";
import { Note } from "../shared/domain/note";
import { Tag } from "../shared/domain/tag";
import { State, Listener, useStore } from "./store";
import { isTest } from "../shared/env";
import { head, isEmpty, isEqual } from "lodash";
import { DataDirectoryModal } from "./components/DataDirectoryModal";
import styled from "styled-components";
import { useApplicationMenu } from "./menus/appMenu";
import { useContextMenu } from "./menus/contextMenu";
import { Editor } from "./components/Editor";

const { ipc } = window;
async function main() {
  let initialState: State;
  let needDataDirectory = false;

  try {
    needDataDirectory = !(await ipc("config.hasDataDirectory"));
    initialState = await loadInitialState();
  } catch (e) {
    console.error("Fatal Error", e);
    await promptFatal((e as Error).message);
    ipc("app.quit");
    return;
  }

  function App(): JSX.Element {
    const store = useStore(initialState);
    useShortcuts(store);
    useApplicationMenu(store);
    useContextMenu(store);
    useEffect(() => {
      store.on("app.quit", quit);
      store.on("app.toggleSidebar", toggleSidebar);
      store.on("app.inspectElement", inspectElement);
      store.on("app.openDevTools", openDevTools);
      store.on("app.reload", reload);
      store.on("app.toggleFullScreen", toggleFullScreen);
      store.on("app.openDataDirectory", openDataDirectory);
      store.on("app.selectDataDirectory", selectDataDirectory);

      store.on("focus.push", push);
      store.on("focus.pop", pop);
      return () => {
        store.off("app.quit", quit);
        store.off("app.toggleSidebar", toggleSidebar);
        store.off("app.inspectElement", inspectElement);
        store.off("app.openDevTools", openDevTools);
        store.off("app.reload", reload);
        store.off("app.toggleFullScreen", toggleFullScreen);
        store.off("app.openDataDirectory", openDataDirectory);
        store.off("app.selectDataDirectory", selectDataDirectory);

        store.off("focus.push", push);
        store.off("focus.pop", pop);
      };
    }, [store]);

    useFocusTracking(store);

    return (
      <Container>
        {!(store.state.ui.sidebar.hidden ?? false) && <Sidebar store={store} />}
        <Editor store={store} />
        {needDataDirectory && <DataDirectoryModal store={store} />}
      </Container>
    );
  }

  render(<App />, document.getElementById("app"));
}

// Don't render when running in test
if (!isTest()) {
  void main();
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
`;

async function loadInitialState(): Promise<State> {
  let ui: UI;
  let shortcuts: Shortcut[] = [];
  let tags: Tag[] = [];
  let notes: Note[] = [];

  // eslint-disable-next-line prefer-const
  [ui, shortcuts, tags, notes] = await Promise.all([
    ipc("app.loadPreviousUIState"),
    ipc("shortcuts.getAll"),
    ipc("tags.getAll"),
    ipc("notes.getAll"),
  ]);

  // Pull in note
  if (ui.editor.noteId != null) {
    ui.editor.content =
      (await ipc("notes.loadContent", ui.editor.noteId)) ?? undefined;
  }

  return {
    ui,
    shortcuts,
    tags,
    notes,
  };
}

/*
 * Don't move these to be in Sidebar.tsx. Otherwise the listener will only work
 * when the sidebar is being rendered.
 */
export const toggleSidebar: Listener<"app.toggleSidebar"> = (_, ctx) => {
  ctx.setUI((prev) => ({
    sidebar: {
      hidden: !(prev.sidebar.hidden ?? false),
    },
  }));
};

export const quit = (): Promise<void> => ipc("app.quit");
export const selectDataDirectory = (): Promise<void> =>
  ipc("config.selectDataDirectory");
export const openDataDirectory = (): Promise<void> =>
  ipc("config.openDataDirectory");
export const openDevTools = (): Promise<void> => ipc("app.openDevTools");
export const reload = (): Promise<void> => ipc("app.reload");
export const toggleFullScreen = (): Promise<void> =>
  ipc("app.toggleFullScreen");
export const inspectElement: Listener<"app.inspectElement"> = ({
  value: coord,
}) => ipc("app.inspectElement", coord);

export const push: Listener<"focus.push"> = ({ value: next }, ctx) => {
  ctx.focus(next);
};

export const pop: Listener<"focus.pop"> = (_, ctx) => {
  ctx.setUI((s) => {
    if (isEmpty(s.focused)) {
      return s;
    }

    return {
      focused: [],
    };
  });
};
