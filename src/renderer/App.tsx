import { render } from "react-dom";
import React, { useEffect } from "react";
import { useShortcuts } from "./io/shortcuts";
import { promptFatal } from "./utils/prompt";
import { Sidebar } from "./components/Sidebar";
import { useFocusTracking } from "./components/shared/Focusable";
import { filterOutStaleNoteIds, Section } from "../shared/ui/app";
import { Shortcut } from "../shared/domain/shortcut";
import { Note } from "../shared/domain/note";
import { State, Listener, useStore } from "./store";
import { isTest } from "../shared/env";
import { first, isEmpty, tail } from "lodash";
import { DataDirectoryModal } from "./components/DataDirectoryModal";
import styled from "styled-components";
import { useApplicationMenu } from "./menus/appMenu";
import { useContextMenu } from "./menus/contextMenu";
import { Editor } from "./components/Editor";
import { h100, HEADER_SIZES, mb2, w100 } from "./css";
import { AppState } from "../shared/ui/app";
import { DEFAULT_SHORTCUTS } from "../shared/io/defaultShortcuts";

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

  render(
    <App initialState={initialState} needDataDirectory={needDataDirectory} />,
    document.getElementById("app")
  );
}

// Don't render when running in test
if (!isTest()) {
  void main();
}

export interface AppProps {
  initialState: State;
  needDataDirectory: boolean;
}

export function App(props: AppProps): JSX.Element {
  const store = useStore(props.initialState);
  const { state } = store;
  const { sidebar, editor } = state;

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

    store.on("sidebar.focusSearch", globalSearch);

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

      store.off("sidebar.focusSearch", globalSearch);

      store.off("focus.push", push);
      store.off("focus.pop", pop);
    };
  }, [store]);

  useFocusTracking(store);

  // Load the content of any notes that were previously open.
  useEffect(() => {
    const tabsToLoad = editor.tabs
      .filter((t) => t.noteContent == null)
      .map((t) => t.noteId);

    if (tabsToLoad.length > 0) {
      store.dispatch("editor.openTab", {
        note: tabsToLoad,
        active: first(sidebar.selected),
      });
    }
  }, [editor.tabs, store, sidebar.selected]);

  return (
    <Container>
      {!(state.sidebar.hidden ?? false) && <Sidebar store={store} />}
      <Editor store={store} />
      {props.needDataDirectory && <DataDirectoryModal store={store} />}
    </Container>
  );
}

const Container = styled.div`
  ${h100}
  ${w100}
  display: flex;
  flex-direction: row;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    ${mb2}
  }

  h1 {
    font-size: ${HEADER_SIZES[0]};
  }

  h2 {
    font-size: ${HEADER_SIZES[1]};
  }

  h3 {
    font-size: ${HEADER_SIZES[2]};
  }

  h4 {
    font-size: ${HEADER_SIZES[3]};
  }

  h5 {
    font-size: ${HEADER_SIZES[4]};
  }

  h6 {
    font-size: ${HEADER_SIZES[5]};
  }
`;

async function loadInitialState(): Promise<State> {
  let ui: AppState;
  const shortcuts: Shortcut[] = DEFAULT_SHORTCUTS;
  console.log("TODO: Re-enable custom shortcuts");
  let notes: Note[] = [];

  // eslint-disable-next-line prefer-const
  [
    ui,
    // shortcuts,
    notes,
  ] = await Promise.all([
    ipc("app.loadAppState"),
    // ipc("shortcuts.getAll"),
    ipc("notes.getAll"),
  ]);

  ui = filterOutStaleNoteIds(ui, notes);

  return {
    ...ui,
    shortcuts,
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
}) => ipc("app.inspectElement", coord!);

export const push: Listener<"focus.push"> = ({ value: next }, ctx) => {
  if (next == null) {
    return;
  }

  const arr = Array.isArray(next) ? next : [next];
  ctx.focus(arr);
};

export const pop: Listener<"focus.pop"> = (_, ctx) => {
  ctx.setUI((s) => {
    if (isEmpty(s.focused)) {
      return s;
    }

    return {
      focused: tail(s.focused),
    };
  });
};

// We need to listen for this even when the sidebar isn't being rendered so we
// put it here.
export const globalSearch: Listener<"sidebar.focusSearch"> = (_, ctx) => {
  ctx.focus([Section.SidebarSearch, Section.Sidebar]);

  // Sidebar could be hidden
  ctx.setUI({
    sidebar: {
      hidden: false,
    },
  });
};
