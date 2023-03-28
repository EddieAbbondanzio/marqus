import { render } from "react-dom";
import React, { useEffect } from "react";
import { useShortcuts } from "./io/shortcuts";
import { promptFatal } from "./utils/prompt";
import { Sidebar } from "./components/Sidebar";
import { useFocusTracking } from "./components/shared/Focusable";
import {
  Cache,
  EditorTab,
  filterOutStaleNoteIds,
  ModelViewState,
  Section,
  SerializedAppState,
} from "../shared/ui/app";
import { getNoteById, Note } from "../shared/domain/note";
import { State, Listener, useStore } from "./store";
import { isTest } from "../shared/env";
import { isEmpty, tail } from "lodash";
import styled from "styled-components";
import { useApplicationMenu } from "./menus/appMenu";
import { useContextMenu } from "./menus/contextMenu";
import { Editor } from "./components/Editor";
import { h100, w100 } from "./css";
import { Config } from "../shared/domain/config";
import { log } from "./logger";
import { arrayify } from "../shared/utils";
import { NoteDirectoryModal } from "./components/NoteDirectoryModal";
import { searchNotes } from "./components/SidebarSearch";
import { Shortcut } from "../shared/domain/shortcut";

async function main() {
  let config: Config;
  let initialState: State;
  let initialCache: Cache;

  try {
    config = await window.ipc("config.get");
    const loadedState = await loadInitialState(config);
    initialState = loadedState.state;
    initialCache = loadedState.cache;
  } catch (e) {
    await log.error("Fatal: Failed to initialize the app.", e as Error);
    await promptFatal("Failed to initialize app.", e as Error);
    return;
  }

  render(
    <App state={initialState} config={config} cache={initialCache} />,
    document.getElementById("app"),
  );
}

// Don't render when running in test
if (!isTest()) {
  void main();
}

export interface AppProps {
  state: State;
  cache: Cache;
  config: Config;
}

export function App(props: AppProps): JSX.Element {
  const { config } = props;
  const store = useStore(props.state, props.cache);
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
    store.on("app.openNoteDirectory", opeNoteDirectory);
    store.on("app.selectNoteDirectory", selectNoteDirectory);
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
      store.off("app.openNoteDirectory", opeNoteDirectory);
      store.off("app.selectNoteDirectory", selectNoteDirectory);
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
      <Editor store={store} config={config} />
      {props.config.noteDirectory == null && (
        <NoteDirectoryModal store={store} />
      )}
    </Container>
  );
}

const Container = styled.div`
  ${h100}
  ${w100}
  display: flex;
  flex-direction: row;
`;

export async function loadInitialState(
  config: Config,
): Promise<{ state: State; cache: Cache }> {
  const promises = [
    window.ipc("app.loadAppState"),
    window.ipc("shortcuts.getAll"),
  ];

  // Can't load notes without a note directory
  if (config.noteDirectory != null) {
    promises.push(window.ipc("notes.getAll"));
  }

  const [ui, shortcuts, notes = []] = (await Promise.all(promises)) as [
    SerializedAppState,
    Shortcut[],
    Note[],
  ];

  // Fail softly if a note can't be found for a tab. The user may have manually
  // deleted the note prior to opening the app.
  const tabs: EditorTab[] = ui.editor.tabs
    .map(t => ({
      note: getNoteById(notes, t.noteId, false),
      lastActive: t.lastActive,
    }))
    .filter(t => t.note != null) as EditorTab[];

  // TODO: Find a better option than this. I suspect we need to refactor our store
  // a bit to support external state better.
  const searchResults = searchNotes(notes, ui.sidebar.searchString ?? "").map(
    n => n.id,
  );

  const deserializedAppState = filterOutStaleNoteIds(
    {
      ...ui,
      sidebar: {
        ...ui.sidebar,
        searchResults,
      },
      editor: {
        ...ui.editor,
        tabs,
      },
    },
    notes,
  );

  const modelViewStates: Record<string, ModelViewState> = {};
  for (const tab of ui.editor.tabs) {
    if (tab.viewState) {
      modelViewStates[tab.noteId] = { viewState: tab.viewState };
    }
  }

  return {
    state: {
      ...deserializedAppState,
      shortcuts,
      notes,
    },
    cache: {
      modelViewStates,
    },
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

export const quit = (): Promise<void> => window.ipc("app.quit");
export const selectNoteDirectory = (): Promise<void> =>
  window.ipc("config.selectNoteDirectory");
export const opeNoteDirectory = (): Promise<void> =>
  window.ipc("config.openNoteDirectory");
export const openDevTools = (): Promise<void> => window.ipc("app.openDevTools");
export const reload = (): Promise<void> => window.ipc("app.reload");
export const toggleFullScreen = (): Promise<void> =>
  window.ipc("app.toggleFullScreen");
export const inspectElement: Listener<"app.inspectElement"> = ({
  value: coord,
}) => window.ipc("app.inspectElement", coord!);
export const openConfig = (): Promise<void> =>
  window.ipc("config.openInTextEditor");

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
  window.ipc("app.openLogDirectory");

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
  await window.ipc("app.toggleAutoHideAppMenu");
};
