import { useEffect, useMemo } from "react";
import { Menu } from "../../shared/domain/ui";
import { isDevelopment } from "../../shared/env";
import { getSidebarMenuAttribute } from "../components/SidebarMenu";
import { getShortcutLabels } from "../io/shortcuts";
import { Store } from "../store";

export function useContextMenu(store: Store): void {
  // useMemo prevents unneccessary renders
  const shortcutLabels = useMemo(
    () => getShortcutLabels(store.state.shortcuts),
    [store.state.shortcuts]
  );
  const focused = store.state.ui.focused[0];
  const selected = store.state.ui.sidebar.selected?.[0];

  useEffect(() => {
    const showMenu = (ev: MouseEvent) => {
      const target = getSidebarMenuAttribute(ev.target as HTMLElement);
      const items: Menu[] = [];
      if (focused === "sidebar") {
        items.push({
          label: "New note",
          event: "sidebar.createNote",
          eventInput: target,
        });

        if (target != null) {
          items.push(
            {
              label: "Rename note",
              event: "sidebar.renameNote",
              eventInput: target,
              shortcut: shortcutLabels["sidebar.renameNote"],
            },
            {
              label: "Permanently delete",
              event: "sidebar.deleteNote",
              eventInput: target,
              shortcut: shortcutLabels["sidebar.deleteNote"],
            },
            {
              label: "Move to trash",
              event: "sidebar.moveNoteToTrash",
              eventInput: target,
              shortcut: shortcutLabels["sidebar.moveNoteToTrash"],
            }
          );
        }
      }

      if (isDevelopment()) {
        items.push({
          type: "separator",
        });
        items.push({
          label: "Inspect element",
          event: "app.inspectElement",
          eventInput: target,
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
  }, [selected, focused, shortcutLabels]);

  useEffect(() => {
    const onClick = (ev: CustomEvent) => {
      console.log("CLIK!", ev);
      const { event, eventInput } = ev.detail;
      store.dispatch(event, eventInput);
    };

    window.addEventListener("contextmenuclick", onClick);
    return () => {
      window.removeEventListener("contextmenuclick", onClick);
    };
  }, [store]);
}
