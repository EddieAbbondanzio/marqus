import React, { useEffect, useRef, useState } from "react";
import { PropsWithChildren } from "react";
import { classList } from "../../../shared/dom";
import { getNodeEnv } from "../../../shared/env";
import { generateId } from "../../../shared/id";
import { KeyCode, keyCodesToString } from "../../../shared/io/keyCode";
import { State } from "../../../shared/state";
import { Execute } from "../../io/commands";
import { CommandType } from "../../io/commands/types";
import { useKeyboard } from "../../io/keyboard";
import { findParent } from "../../utils/findParent";

export interface ContextMenuProps {
  name: string;
  items: ContextMenuItem[];
  state: State;
  execute: Execute;
}
export type ContextMenuItem =
  | { type: "divider" }
  | { type: "option"; text: string; command: CommandType };

export function ContextMenuDivider() {
  return <hr className="m-0" />;
}

export interface ContextMenuItemProps {
  text: string;
  selected: boolean;
  click: () => void;
  shortcut?: string;
}

export function ContextMenuItem(props: ContextMenuItemProps) {
  const classes = classList(
    "px-2",
    "py-1",
    "is-flex",
    "is-justify-content-space-between",
    "is-align-items-center",
    props.selected ? "has-background-primary" : undefined
  );

  return (
    <div onClick={props.click} className={classes} key={props.text}>
      <span>{props.text}</span>
      <span className="is-size-7 is-uppercase has-text-grey pl-2">
        {props.shortcut}
      </span>
    </div>
  );
}

export interface ContextMenuState {
  active: boolean;
  id?: string;
  top?: number;
  left?: number;
  selected?: number;
}

export function ContextMenu(props: PropsWithChildren<ContextMenuProps>) {
  const wrapperRef = useRef(null! as HTMLDivElement);
  const menuRef = useRef(null! as HTMLDivElement);

  const [state, setState] = useState<ContextMenuState>({
    active: false,
  });

  console.log(state.selected);

  const itemsToRender = [...props.items];
  if (getNodeEnv() === "development") {
    itemsToRender.push(
      { type: "divider" },
      {
        type: "option",
        text: "Reload",
        command: "app.reload",
      },
      {
        type: "option",
        text: "Open Dev Tools",
        command: "app.openDevTools",
      }
    );
  }

  const renderedItems = itemsToRender.map((item, i) => {
    if (item.type === "divider") {
      return <ContextMenuDivider key={i} />;
    } else {
      const shortcut = props.state.shortcuts.find(
        (s) => s.command === item.command
      );

      const shortcutString = shortcut
        ? keyCodesToString(shortcut.keys)
        : undefined;
      return (
        <ContextMenuItem
          text={item.text}
          selected={i === state.selected}
          click={() => props.execute(item.command)}
          shortcut={shortcutString}
          key={i}
        />
      );
    }
  });

  const keyboard = useKeyboard(menuRef);
  keyboard.listen(
    {
      event: "keydown",
      keys: [KeyCode.Escape, KeyCode.Enter, KeyCode.ArrowUp, KeyCode.ArrowDown],
    },
    async (_, key) => {
      switch (key) {
        case KeyCode.Enter:
          break;

        case KeyCode.Escape:
          setState({
            active: false,
          });
          break;

        case KeyCode.ArrowUp:
          if (state.selected == null) {
            return;
          } else if (state.selected > 0) {
            let nextSelected = state.selected - 1;

            // Hack but should be safe to assume we'll never have two dividers in a row.
            if (itemsToRender[nextSelected].type === "divider") {
              nextSelected--;
            }

            setState({
              ...state,
              selected: nextSelected,
            });
          }
          break;

        case KeyCode.ArrowDown:
          if (state.selected == null) {
            setState({
              ...state,
              selected: 0,
            });
          } else if (state.selected < itemsToRender.length - 1) {
            let nextSelected = state.selected + 1;

            // Hack but should be safe to assume we'll never have two dividers in a row.
            if (itemsToRender[nextSelected].type === "divider") {
              nextSelected++;
            }

            setState({
              ...state,
              selected: nextSelected,
            });
          }

          break;
      }
    }
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (menuRef.current != null) {
      menuRef.current.focus();
    }

    const onContextMenu = (ev: MouseEvent) => {
      const id = generateId();
      const { clientX: left, clientY: top } = ev;

      setState({
        ...state,
        id,
        top,
        left,
        active: true,
      });
    };

    const listenForClose = (ev: MouseEvent) => {
      const match = findParent(
        ev.target as HTMLElement,
        (el) => el.id === state.id
      );

      if (!match) {
        setState({
          active: false,
        });
      }
    };

    wrapper.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("click", listenForClose);

    return () => {
      wrapper.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("clicK", listenForClose);
    };
  }, [state.active]);

  return (
    <div
      ref={wrapperRef}
      className="is-flex is-flex-direction-column is-flex-grow-1"
      data-context-menu={props.name}
    >
      {state.active && (
        <div
          ref={menuRef}
          className="box m-0 p-0"
          id={state.id}
          style={{
            position: "absolute",
            zIndex: 1,
            top: state.top,
            left: state.left,
          }}
          tabIndex={-1}
        >
          <div>{renderedItems}</div>
        </div>
      )}
      {props.children}
    </div>
  );
}
