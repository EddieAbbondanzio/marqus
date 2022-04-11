import { render } from "react-dom";
import React, { useEffect } from "react";
import { getShortcutLabels, useShortcuts } from "./io/shortcuts";
import { promptFatal } from "./utils/prompt";
import { Sidebar } from "./components/Sidebar";
import { useFocusTracking } from "./components/shared/Focusable";
import { UIEventType, UIEventInput, Section, UI } from "../shared/domain/ui";
import { Shortcut } from "../shared/domain/shortcut";
import { Note } from "../shared/domain/note";
import { Tag } from "../shared/domain/tag";
import { State, Store, StoreListener, useStore } from "./store";
import { isTest } from "../shared/env";
import { head, isEmpty, isEqual } from "lodash";
import { Editor } from "./components/Editor";
import { DataDirectoryModal } from "./components/DataDirectoryModal";
import styled from "styled-components";

const { ipc } = window;
async function main() {
  let initialState: State;
  let needDataDirectory = false;

  try {
    needDataDirectory = !(await ipc.invoke("config.hasDataDirectory"));
    initialState = await loadInitialState();
  } catch (e) {
    console.error("Fatal Error", e);
    await promptFatal((e as Error).message);
    ipc.invoke("app.quit");
    return;
  }

  function App(): JSX.Element {
    const store = useStore(initialState);
    useShortcuts(store);
    useApplicationMenu(store);

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
    }, [store]);

    useFocusTracking(store);

    return (
      <Container>
        {!(store.state.ui.sidebar.hidden ?? false) && <Sidebar store={store} />}
        <Editor store={store} />
        {needDataDirectory && <DataDirectoryModal />}
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
    ipc.invoke("app.loadPreviousUIState"),
    ipc.invoke("shortcuts.getAll"),
    ipc.invoke("tags.getAll"),
    ipc.invoke("notes.getAll"),
  ]);

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
export const toggleSidebar: StoreListener<"sidebar.toggle"> = (_, ctx) => {
  ctx.setUI((prev) => ({
    sidebar: {
      hidden: !(prev.sidebar.hidden ?? false),
    },
  }));
};

export const openDevTools = (): void => ipc.invoke("app.openDevTools");
export const reload = (): void => ipc.invoke("app.reload");
export const toggleFullScreen = (): void => ipc.invoke("app.toggleFullScreen");
export const inspectElement: StoreListener<"app.inspectElement"> = ({
  value: coord,
}) => ipc.invoke("app.inspectElement", coord);

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

export function useApplicationMenu(store: Store): void {
  (async () => {
    const shortcutLabels = getShortcutLabels(store.state.shortcuts);

    const clicked = await window.ipc.invoke("app.setApplicationMenu", [
      {
        label: "File",
        children: [
          // { label: "Change data directory" },
          {
            label: "Reload app",
            shortcut: shortcutLabels["app.reload"],
            event: "app.reload",
            eventInput: undefined,
          },
        ],
      },
      // {
      //   label: "Edit",
      //   children: [{ label: "Cut" }, { label: "Copy" }, { label: "Paste" }],
      // },
      {
        label: "View",
        children: [
          {
            label: "Toggle sidebar",
            shortcut: shortcutLabels["sidebar.toggle"],
            event: "sidebar.toggle",
          },
        ],
      },
    ]);

    try {
      store.dispatch(
        clicked.event as UIEventType,
        clicked.eventInput as UIEventInput<UIEventType>
      );
    } catch (e) {
      // Swallow errors from electron complaining ipc invoke didn't return.
      if (!(e as Error).message.endsWith("reply was never sent")) {
        throw e;
      }
    }
  })();
}
