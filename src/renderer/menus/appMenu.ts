import { useEffect, useMemo } from "react";
import { Menu } from "../../shared/ui/menu";
import { isDevelopment } from "../../shared/env";
import { getShortcutLabels } from "../io/shortcuts";
import { Store } from "../store";
import { IpcChannel } from "../../shared/ipc";

export function useApplicationMenu(store: Store): void {
  const { state } = store;

  // useMemo prevents unnecessary renders
  const shortcutLabels = useMemo(
    () => getShortcutLabels(store.state.shortcuts),
    [store.state.shortcuts]
  );
  const focused = state.focused[0];
  const selected = state.sidebar.selected?.[0];
  const { isEditing } = state.editor;

  useEffect(() => {
    const optionals: Menu[] = [];
    if (isDevelopment()) {
      optionals.push({
        label: "&Developer",
        type: "submenu",
        children: [
          {
            label: "Open dev tools",
            type: "normal",
            shortcut: shortcutLabels["app.openDevTools"],
            event: "app.openDevTools",
          },
        ],
      });
    }

    void window.ipc("app.setApplicationMenu", [
      {
        label: "&File",
        type: "submenu",
        children: [
          {
            label: isEditing ? "Stop editing" : "Edit",
            type: "normal",
            shortcut: shortcutLabels["editor.toggleView"],
            event: "editor.toggleView",
          },
          {
            label: "Delete note",
            type: "normal",
            shortcut: shortcutLabels["sidebar.deleteNote"],
            event: "sidebar.deleteNote",
            eventInput: selected,
            disabled: selected == null,
          },
          {
            label: "Move note to trash",
            type: "normal",
            shortcut: shortcutLabels["sidebar.moveNoteToTrash"],
            event: "sidebar.moveNoteToTrash",
            eventInput: selected,
            disabled: selected == null,
          },
          {
            label: "Open data directory",
            type: "normal",
            shortcut: shortcutLabels["app.openDataDirectory"],
            event: "app.openDataDirectory",
          },
          {
            label: "Change data directory",
            type: "normal",
            shortcut: shortcutLabels["app.selectDataDirectory"],
            event: "app.selectDataDirectory",
          },
          {
            type: "separator",
          },
          {
            label: "Reload",
            type: "normal",
            shortcut: shortcutLabels["app.reload"],
            event: "app.reload",
          },
          {
            label: "Quit",
            type: "normal",
            shortcut: shortcutLabels["app.quit"],
            event: "app.quit",
          },
        ],
      },
      {
        label: "&Edit",
        type: "submenu",
        children: [
          {
            label: "Cut",
            type: "normal",
            role: "cut",
            disabled: focused !== "editor",
          },
          {
            label: "Copy",
            type: "normal",
            role: "copy",
            disabled: focused !== "editor",
          },
          {
            label: "Paste",
            type: "normal",
            role: "paste",
            disabled: focused !== "editor",
          },
        ],
      },
      {
        label: "&View",
        type: "submenu",
        children: [
          {
            label: "Fullscreen",
            type: "normal",
            shortcut: shortcutLabels["app.toggleFullScreen"],
            event: "app.toggleFullScreen",
          },
          {
            label: "Toggle sidebar",
            type: "normal",
            shortcut: shortcutLabels["app.toggleSidebar"],
            event: "app.toggleSidebar",
          },
        ],
      },
      ...optionals,
    ]);
  }, [focused, selected, shortcutLabels, isEditing]);

  useEffect(() => {
    const onClick = (ev: CustomEvent) => {
      const { event, eventInput } = ev.detail;
      store.dispatch(event, eventInput);
    };

    window.addEventListener(IpcChannel.ApplicationMenuClick, onClick);
    return () => {
      window.removeEventListener(IpcChannel.ApplicationMenuClick, onClick);
    };
  }, [store]);
}
