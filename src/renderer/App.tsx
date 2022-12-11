import { render } from "react-dom";
import React, { useEffect } from "react";
import { useShortcuts } from "./io/shortcuts";
import { promptFatal } from "./utils/prompt";
import { Sidebar } from "./components/Sidebar";
import { useFocusTracking } from "./components/shared/Focusable";
import {
  EditorTab,
  filterOutStaleNoteIds,
  Section,
  SerializedAppState,
} from "../shared/ui/app";
import { Shortcut } from "../shared/domain/shortcut";
import { getNoteById, Note } from "../shared/domain/note";
import { State, Listener, useStore } from "./store";
import { isTest } from "../shared/env";
import { isEmpty, tail } from "lodash";
import { DataDirectoryModal } from "./components/DataDirectoryModal";
import styled from "styled-components";
import { useApplicationMenu } from "./menus/appMenu";
import { useContextMenu } from "./menus/contextMenu";
import { Editor } from "./components/Editor";
import { h100, HEADER_SIZES, mb2, w100 } from "./css";
import { Config } from "../shared/domain/config";
import { log } from "./logger";
import { arrayify } from "../shared/utils";

const { ipc } = window;
async function main() {
  let config: Config;
  let initialState: State;

  try {
    config = await ipc("config.get");
    initialState = await loadInitialState(config);
  } catch (e) {
    await log.error("Fatal: Failed to initialize the app.", e as Error);
    await promptFatal("Failed to initialize app.", e as Error);
    return;
  }

  render(
    <App state={initialState} config={config} />,
    document.getElementById("app"),
  );
}

// Don't render when running in test
if (!isTest()) {
  void main();
}

export interface AppProps {
  state: State;
  config: Config;
}

export function App(props: AppProps): JSX.Element {
  const { config } = props;
  const store = useStore(props.state);
  const { state } = store;

  useShortcuts(store);
  useApplicationMenu(store, config);
  useContextMenu(store, config);
  useEffect(() => {
    store.on("app.quit", quit);
    store.on("app.toggleSidebar", toggleSidebar);
    store.on("app.inspectElement", inspectElement);
    store.on("app.openDevTools", openDevTools);
    store.on("app.reload", reload);
    store.on("app.toggleFullScreen", toggleFullScreen);
    store.on("app.openDataDirectory", openDataDirectory);
    store.on("app.selectDataDirectory", selectDataDirectory);
    store.on("app.openLogDirectory", openLogs);
    store.on("app.openConfig", openConfig);
    store.on("app.openNoteAttachments", openNoteAttachments);
    store.on("app.toggleAutoHideAppMenu", toggleAutoHideAppMenu);

    store.on("sidebar.focusSearch", globalSearch);

    store.on("focus.push", push);
    store.on("focus.pop", pop);

    const onError = async (err: ErrorEvent) => {
      await log.error("Uncaught Error:", err.error);

      // N.B. We add a delay to slow down refreshes in case an infinite loop was
      // somehow triggered.
      setTimeout(async () => {
        await log.info("Attempting to recover from error. Reloading!");
        window.location.reload();
      }, 10000);
    };
    window.addEventListener("error", onError);

    return () => {
      window.removeEventListener("error", onError);

      store.off("app.quit", quit);
      store.off("app.toggleSidebar", toggleSidebar);
      store.off("app.inspectElement", inspectElement);
      store.off("app.openDevTools", openDevTools);
      store.off("app.reload", reload);
      store.off("app.toggleFullScreen", toggleFullScreen);
      store.off("app.openDataDirectory", openDataDirectory);
      store.off("app.selectDataDirectory", selectDataDirectory);
      store.off("app.openLogDirectory", openLogs);
      store.off("app.openConfig", openConfig);
      store.off("app.openNoteAttachments", openNoteAttachments);
      store.off("app.toggleAutoHideAppMenu", toggleAutoHideAppMenu);

      store.off("sidebar.focusSearch", globalSearch);

      store.off("focus.push", push);
      store.off("focus.pop", pop);
    };
  }, [store]);

  useFocusTracking(store);

  return (
    <Container>
      {!(state.sidebar.hidden ?? false) && <Sidebar store={store} />}
      <Editor store={store} />
      {props.config.dataDirectory == null && (
        <DataDirectoryModal store={store} />
      )}
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

export async function loadInitialState(config: Config): Promise<State> {
  let ui: SerializedAppState;
  let shortcuts: Shortcut[] = [];
  let notes: Note[] = [];

  if (config.dataDirectory == null) {
    ui = await ipc("app.loadAppState");
  } else {
    [ui, shortcuts, notes] = await Promise.all([
      ipc("app.loadAppState"),
      ipc("shortcuts.getAll"),
      ipc("notes.getAll"),
    ]);
  }

  const tabs: EditorTab[] = ui.editor.tabs
    .map(t => ({
      note: getNoteById(notes, t.noteId, false),
      lastActive: t.lastActive,
    }))
    .filter(t => t.note != null) as EditorTab[];

  const deserializedAppState = filterOutStaleNoteIds(
    {
      ...ui,
      editor: {
        ...ui.editor,
        tabs,
      },
    },
    notes,
  );

  return {
    ...deserializedAppState,
    shortcuts,
    notes,
  };
}

// N.B. app.toggleSidebar listener must be keep here because if we move it to
// Sidebar.tsx the listener won't work when the sidebar is hidden because the
// component isn't being rendered.
export const toggleSidebar: Listener<"app.toggleSidebar"> = (_, ctx) => {
  ctx.setUI(prev => ({
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
export const openConfig = (): Promise<void> => ipc("config.openInTextEditor");

export const push: Listener<"focus.push"> = ({ value: next }, ctx) => {
  if (next == null) {
    return;
  }

  const arr = arrayify(next);
  ctx.focus(arr);
};

export const pop: Listener<"focus.pop"> = (_, ctx) => {
  ctx.setUI(s => {
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

export const openLogs: Listener<"app.openLogDirectory"> = () =>
  ipc("app.openLogDirectory");

export const openNoteAttachments: Listener<
  "app.openNoteAttachments"
> = async ev => {
  const { value: noteId } = ev;
  if (noteId == null) {
    return;
  }

  await window.ipc("notes.openAttachments", noteId);
};

export const toggleAutoHideAppMenu: Listener<
  "app.toggleAutoHideAppMenu"
> = async () => {
  await ipc("app.toggleAutoHideAppMenu");
};
