import React, { useContext, useEffect, useRef, useState } from "react";
import { PropsWithChildren } from "react";
import { generateId } from "../../../shared/domain";
import { keyCodesToString } from "../../../shared/io/keyCode";
import { AppContext, useAppContext } from "../../App";
import { CommandName } from "../../commands";
import { findParent } from "../../ui/findParent";

export interface ContextMenuItem {
  text: string;
  show?: boolean;
  command: string;
}

export interface ContextMenuProps {
  name: string;
  items: (target: HTMLElement) => ContextMenuItem[];
}

export function ContextMenu(props: PropsWithChildren<ContextMenuProps>) {
  const ref = useRef(null as unknown as HTMLDivElement);
  const [state, setState] = useState({
    id: null as string | null,
    menu: null as JSX.Element | null,
  });

  const context = useAppContext();

  useEffect(() => {
    const wrapper = ref.current;

    const onContextMenu = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement;

      const onClick = (item: ContextMenuItem) => {
        if (item.command != null && item.command.length > 0) {
          console.log("Execute command!");
          void context.execute(item.command as CommandName, undefined!);
        }
      };

      // Render each item
      const items = props.items(target).map((item) => {
        const shortcut = context.state.shortcuts.values.find(
          (s) => s.command === item.command
        );

        const shortcutString =
          shortcut != null ? keyCodesToString(shortcut.keys) : null;

        return (
          <div
            onClick={() => onClick(item)}
            className="has-background-primary-hover px-2 py-1"
            key={item.text}
          >
            {item.text}
            <span className="is-size-7 is-uppercase has-text-grey pl-2">
              {shortcutString}
            </span>
          </div>
        );
      });

      const id = generateId();
      const top = ev.clientY;
      const left = ev.clientX;

      const menu = (
        <div
          className="box m-0 p-0"
          id={id}
          style={{ position: "absolute", zIndex: 1, top, left }}
        >
          <div>{items}</div>
        </div>
      );

      setState({
        id,
        menu,
      });
    };

    const listenForClose = (ev: MouseEvent) => {
      const match = findParent(
        ev.target as HTMLElement,
        (el) => el.id === state.id
      );

      if (!match) {
        setState({
          id: null,
          menu: null,
        });
      }
    };

    // How do we know when to close it?

    wrapper.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("click", listenForClose);

    return () => {
      wrapper.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("clicK", listenForClose);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="is-flex is-flex-direction-column is-flex-grow-1"
      data-context-menu={props.name}
    >
      {state.menu}
      {props.children}
    </div>
  );
}
