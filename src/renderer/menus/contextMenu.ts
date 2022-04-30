import { useEffect, useMemo } from "react";
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
    const showMenu = () => {
      void window.ipc("app.showContextMenu", [
        {
          label: "&RAVIOLI",
          children: [
            {
              label: "DO IT!",
              shortcut: shortcutLabels["app.reload"],
              event: "app.reload",
              disabled: selected == null,
            },
          ],
        },
        {
          label: "&HIDDEN",
          hidden: true,
          event: "app.reload",
        },
      ]);
    };

    window.addEventListener("contextmenu", showMenu);
    return () => {
      window.removeEventListener("contextmenu", showMenu);
    };
  }, [focused, selected, shortcutLabels]);

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
