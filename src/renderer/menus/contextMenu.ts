import { useEffect, useMemo } from "react";
import {
  getNoteById,
  Note,
  NoteSort,
  NOTE_SORT_LABELS,
} from "../../shared/domain/note";
import { Menu, SubMenu } from "../../shared/ui/menu";

import { isDevelopment } from "../../shared/env";
import { getFocusableAttribute } from "../components/shared/Focusable";
import { getSidebarMenuAttribute } from "../components/SidebarMenu";
import { getShortcutLabels } from "../io/shortcuts";
import { Store } from "../store";
import { Section } from "../../shared/ui/app";
import { getEditorTabAttribute } from "../components/EditorTabs";

export function useContextMenu(store: Store): void {
  const { state } = store;

  // useMemo prevents unneccessary renders
  const shortcutLabels = useMemo(
    () => getShortcutLabels(state.shortcuts),
    [state.shortcuts]
  );

  useEffect(() => {
    const showMenu = (ev: MouseEvent) => {
      // Right clicking won't trigger a focus change so we need to manually
      // determine what focusable the click occured in.
      const focusable = getFocusableAttribute(ev.target as HTMLElement);

      const items: Menu[] = [];
      switch (focusable) {
        case Section.Sidebar:
          const noteId = getSidebarMenuAttribute(ev.target as HTMLElement);
          let note: Note | undefined;
          if (noteId != null) {
            note = getNoteById(state.notes, noteId);
          }

          items.push({
            label: "New note",
            type: "normal",
            event: "sidebar.createNote",
            eventInput: noteId,
          });

          if (noteId != null) {
            items.push(
              {
                label: "Rename note",
                type: "normal",
                event: "sidebar.renameNote",
                eventInput: noteId,
                shortcut: shortcutLabels["sidebar.renameNote"],
              },
              {
                label: "Permanently delete",
                type: "normal",
                event: "sidebar.deleteNote",
                eventInput: noteId,
                shortcut: shortcutLabels["sidebar.deleteNote"],
              },
              {
                label: "Move to trash",
                type: "normal",
                event: "sidebar.moveNoteToTrash",
                eventInput: noteId,
                shortcut: shortcutLabels["sidebar.moveNoteToTrash"],
              }
            );

            // Only show sort menu for notes if they have children.
            if (note == null || note?.children) {
              items.push(buildNoteSortMenu(state.sidebar.sort, note));
            }
          }

          items.push({
            type: "separator",
          });
          items.push({
            label: "Collapse all",
            type: "normal",
            event: "sidebar.collapseAll",
            shortcut: shortcutLabels["sidebar.collapseAll"],
          });
          items.push({
            label: "Expand all",
            type: "normal",
            event: "sidebar.expandAll",
            shortcut: shortcutLabels["sidebar.expandAll"],
          });
          break;

        case Section.EditorTabs:
          const tabNoteId = getEditorTabAttribute(ev.target as HTMLElement);

          if (tabNoteId != null) {
            items.push({
              label: "Close",
              type: "normal",
              event: "editor.closeTab",
              eventInput: tabNoteId,
            });
          }
          break;
      }

      if (isDevelopment()) {
        const { x, y } = (ev.target as HTMLElement).getBoundingClientRect();

        items.push({
          type: "separator",
        });
        items.push({
          label: "Inspect element",
          type: "normal",
          event: "app.inspectElement",
          eventInput: { x, y },
          shortcut: shortcutLabels["app.inspectElement"],
        });
        items.push({
          label: "Open dev tools",
          type: "normal",
          event: "app.openDevTools",
          shortcut: shortcutLabels["app.openDevTools"],
        });
      }

      void window.ipc("app.showContextMenu", items);
    };

    window.addEventListener("contextmenu", showMenu);
    return () => {
      window.removeEventListener("contextmenu", showMenu);
    };
  }, [shortcutLabels, store]);

  useEffect(() => {
    const onClick = (ev: CustomEvent) => {
      const { event, eventInput } = ev.detail;
      store.dispatch(event, eventInput);
    };

    window.addEventListener("contextmenuclick", onClick);
    return () => {
      window.removeEventListener("contextmenuclick", onClick);
    };
  }, [store]);
}

export function buildNoteSortMenu(globalSort: NoteSort, note?: Note): SubMenu {
  const label = note ? "Sort children by" : "Sort notes by";
  const currentSort = note?.sort ?? globalSort;

  const children: Menu[] = Object.values(NoteSort).map((sort) => ({
    label: NOTE_SORT_LABELS[sort],
    type: "radio",
    checked: currentSort === sort,
    event: "sidebar.setNoteSort",
    eventInput: { sort, note: note?.id },
  }));

  // Give the user an easy way to clear out the custom sort for children.
  if (note?.sort) {
    children.push({
      label: "Reset sort",
      type: "normal",
      event: "sidebar.setNoteSort",
      eventInput: { sort: undefined, note: note?.id },
    });
  }

  return {
    label,
    type: "submenu",
    children,
  };
}
