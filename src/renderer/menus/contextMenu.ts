import { useEffect, useMemo } from "react";
import {
  getNoteById,
  Note,
  NoteSort,
  NOTE_SORT_LABELS,
} from "../../shared/domain/note";
import {
  EventMenu,
  Menu,
  RadioMenu,
  SubMenu,
  UIEventInput,
  UIEventType,
} from "../../shared/domain/ui";
import { isDevelopment } from "../../shared/env";
import { getFocusableAttribute } from "../components/shared/Focusable";
import { getSidebarMenuAttribute } from "../components/SidebarMenu";
import { getShortcutLabels } from "../io/shortcuts";
import { Store } from "../store";

export function useContextMenu(store: Store): void {
  // useMemo prevents unneccessary renders
  const shortcutLabels = useMemo(
    () => getShortcutLabels(store.state.shortcuts),
    [store.state.shortcuts]
  );
  useEffect(() => {
    const showMenu = (ev: MouseEvent) => {
      // Right clicking won't trigger a focus change so we need to manually
      // determine what focusable the click occured in.
      const focusable = getFocusableAttribute(ev.target as HTMLElement);
      const noteId = getSidebarMenuAttribute(ev.target as HTMLElement);

      const items: Menu[] = [];
      if (focusable === "sidebar") {
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
        }

        let note: Note | undefined;
        if (noteId != null) {
          note = getNoteById(store.state.notes, noteId);
        }

        // Only show sort menu for notes if they have children.
        if (note == null || note?.children) {
          items.push(
            buildSortSubMenu(
              note?.sort ?? store.state.ui.sidebar.sort,
              note?.id
            )
          );
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

function buildSortSubMenu(activeSort: NoteSort, noteId?: string): SubMenu {
  const label = noteId ? "Sort children by" : "Sort notes by";
  console.log({ activeSort });

  const children: RadioMenu<UIEventType>[] = Object.values(NoteSort).map(
    (sort) => ({
      label: NOTE_SORT_LABELS[sort],
      type: "radio",
      checked: activeSort === sort,
      event: "sidebar.setNoteSort",
      eventInput: { sort, note: noteId },
    })
  );

  return {
    label,
    type: "submenu",
    children,
  };
}
