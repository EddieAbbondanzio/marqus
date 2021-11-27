import React from "react";
import { useEffect } from "react";
import ReactDOM from "react-dom";
import { ContextMenu } from "../../shared/ui/contextMenu";

// Call this in global nav
export function useContextMenu(menu: ContextMenu) {
  useEffect(() => {
    const open = (ev: PointerEvent) => {
      const target = ev.target as HTMLElement;
      const { pageX: x, pageY: y } = ev;

      const menuItems = render(target, menu);

      console.log("CREATE PORTAL");
      ReactDOM.createPortal(<div>{menuItems}</div>, document.body);
      console.log("CREATED!");
      window.addEventListener("click", close);
    };

    const close = (ev: PointerEvent) => {
      window.removeEventListener("click", close);
    };

    window.addEventListener("contextmenu", open);

    return () => {
      window.removeEventListener("contextmenu", open);
    };
  }, []);
}

function render(target: HTMLElement, menu: ContextMenu) {
  return <div className="has-background-danger">Hello World!</div>;
}
