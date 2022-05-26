import { useEffect, useMemo } from "react";
import { NoteSort } from "../../shared/domain/note";
import { Menu } from "../../shared/domain/ui";
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
  const selected = store.state.ui.sidebar.selected?.[0];
  useEffect(() => {
    const showMenu = (ev: MouseEvent) => {
      // Right clicking won't trigger a focus change so we need to manually
      // determine what focusable the click occured in.
      const focusable = getFocusableAttribute(ev.target as HTMLElement);
      const sidebarMenu = getSidebarMenuAttribute(ev.target as HTMLElement);

      const items: Menu[] = [];
      if (focusable === "sidebar") {
        items.push({
          label: "New note",
          event: "sidebar.createNote",
          eventInput: sidebarMenu,
        });

        if (sidebarMenu != null) {
          items.push(
            {
              label: "Rename note",
              event: "sidebar.renameNote",
              eventInput: sidebarMenu,
              shortcut: shortcutLabels["sidebar.renameNote"],
            },
            {
              label: "Permanently delete",
              event: "sidebar.deleteNote",
              eventInput: sidebarMenu,
              shortcut: shortcutLabels["sidebar.deleteNote"],
            },
            {
              label: "Move to trash",
              event: "sidebar.moveNoteToTrash",
              eventInput: sidebarMenu,
              shortcut: shortcutLabels["sidebar.moveNoteToTrash"],
            }
          );
        }

        if (sidebarMenu == null) {
          items.push({
            label: "Sort notes by",
            children: [
              {
                label: "A - Z",
                event: "sidebar.sortNotes",
                type: "radio",
                checked: true,
                eventInput: { sort: NoteSort.Alphanumeric },
              },
              { label: "Z - A", event: "app.reload" },
              { label: "Newest", event: "app.reload" },
              { label: "Oldest", event: "app.reload" },
              { label: "Last Modified", event: "app.reload" },
              { label: "First Modified", event: "app.reload" },
              { label: "Manual", event: "app.reload" },
            ],
          });
        } else {
          items.push({
            label: "Sort children by",
            children: [
              { label: "Alphanumeric", event: "app.reload" },
              { label: "Alphanumeric reversed", event: "app.reload" },
              { label: "Date created", event: "app.reload" },
              { label: "Date created reversed", event: "app.reload" },
              { label: "Date updated", event: "app.reload" },
              { label: "Date updated reversed", event: "app.reload" },
              { label: "Manual", event: "app.reload" },
            ],
          });
        }

        items.push({
          type: "separator",
        });
        items.push({
          label: "Collapse all",
          event: "sidebar.collapseAll",
          shortcut: shortcutLabels["sidebar.collapseAll"],
        });
        items.push({
          label: "Expand all",
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
          event: "app.inspectElement",
          eventInput: { x, y },
          shortcut: shortcutLabels["app.inspectElement"],
        });
        items.push({
          label: "Open dev tools",
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
  }, [selected, shortcutLabels]);

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
