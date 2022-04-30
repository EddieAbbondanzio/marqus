import { useEffect, useMemo } from "react";
import { getShortcutLabels } from "../io/shortcuts";
import { Store } from "../store";

export function useApplicationMenu(store: Store): void {
  // useMemo prevents unneccessary renders
  const shortcutLabels = useMemo(
    () => getShortcutLabels(store.state.shortcuts),
    [store.state.shortcuts]
  );
  const focused = store.state.ui.focused[0];
  const selected = store.state.ui.sidebar.selected?.[0];
  const isEditting = store.state.ui.editor.isEditting;

  useEffect(() => {
    void window.ipc("app.setApplicationMenu", [
      {
        label: "&File",
        children: [
          {
            label: isEditting ? "Stop editting" : "Edit",
            shortcut: shortcutLabels["editor.toggleView"],
            event: "editor.toggleView",
          },
          {
            label: "Delete note",
            shortcut: shortcutLabels["sidebar.deleteNote"],
            event: "sidebar.deleteNote",
            eventInput: selected,
            disabled: selected == null,
          },
          {
            label: "Move note to trash",
            shortcut: shortcutLabels["sidebar.moveNoteToTrash"],
            event: "sidebar.moveNoteToTrash",
            eventInput: selected,
            disabled: selected == null,
          },
          {
            label: "Open data directory",
            shortcut: shortcutLabels["app.openDataDirectory"],
            event: "app.openDataDirectory",
          },
          {
            label: "Change data directory",
            shortcut: shortcutLabels["app.selectDataDirectory"],
            event: "app.selectDataDirectory",
          },
          {
            type: "separator",
          },
          {
            label: "Reload",
            shortcut: shortcutLabels["app.reload"],
            event: "app.reload",
          },
          {
            label: "Quit",
            shortcut: shortcutLabels["app.quit"],
            event: "app.quit",
          },
        ],
      },
      {
        label: "&Edit",
        children: [
          {
            label: "Cut",
            role: "cut",
            disabled: focused !== "editor",
          },
          {
            label: "Copy",
            role: "copy",
            disabled: focused !== "editor",
          },
          {
            label: "Paste",
            role: "paste",
            disabled: focused !== "editor",
          },
        ],
      },
      {
        label: "&View",
        children: [
          {
            label: "Fullscreen",
            shortcut: shortcutLabels["app.toggleFullScreen"],
            event: "app.toggleFullScreen",
          },
          {
            label: "Toggle sidebar",
            shortcut: shortcutLabels["app.toggleSidebar"],
            event: "app.toggleSidebar",
          },
        ],
      },
    ]);
  }, [focused, selected, shortcutLabels, isEditting]);

  useEffect(() => {
    const onClick = (ev: CustomEvent) => {
      const { event, eventInput } = ev.detail;
      store.dispatch(event, eventInput);
    };

    window.addEventListener("applicationmenuclick", onClick);
    return () => {
      window.removeEventListener("applicationmenuclick", onClick);
    };
  }, [store]);
}
