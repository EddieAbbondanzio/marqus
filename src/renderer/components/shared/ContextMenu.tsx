import React, {
  RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PropsWithChildren } from "react";
import { classList } from "../../../shared/dom";
import { getNodeEnv } from "../../../shared/env";
import { uuid } from "../../../shared/id";
import { KeyCode, keyCodesToString } from "../../../shared/io/keyCode";
import { State } from "../../../shared/state";
import { Execute } from "../../io/commands";
import { CommandType } from "../../io/commands/types";
import { useFocus } from "../../io/focus";
import { useKeyboard } from "../../io/keyboard";
import { Mouse, useMouse } from "../../io/mouse";
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
  id: string;
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
    <div
      onClick={props.click}
      className={classes}
      key={props.text}
      data-context-menu-item={props.id}
    >
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
  console.log("context menu render");
  const wrapperRef = useRef(null! as HTMLDivElement);
  const menuRef = useRef(null! as HTMLDivElement);

  const [state, setState] = useState<ContextMenuState>({
    active: false,
  });

  const itemsToRender = useMemo(() => {
    const items = [
      ...props.items.map((item) =>
        item.type === "divider" ? item : { ...item, id: uuid() }
      ),
    ];

    if (getNodeEnv() === "development") {
      items.push(
        { type: "divider" },
        {
          id: uuid(),
          type: "option",
          text: "Reload",
          command: "app.reload",
        },
        {
          id: uuid(),
          type: "option",
          text: "Open Dev Tools",
          command: "app.openDevTools",
        }
      );
    }

    return items;
  }, [props.items]);

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
          id={item.id}
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
          if (state.selected == null) {
            return;
          }

          const selectedItem = itemsToRender[state.selected];
          if (selectedItem && selectedItem.type === "option") {
            void props.execute(selectedItem.command);
          }
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

  useFocus(menuRef);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    const onContextMenu = (ev: MouseEvent) => {
      const id = uuid();
      const { clientX: left, clientY: top } = ev;

      setState({
        ...state,
        id,
        top,
        left,
        active: true,
      });
    };

    const updateSelected = (ev: MouseEvent) => {
      const itemId = findParent(
        ev.target as HTMLElement,
        (el) => el.hasAttribute("data-context-menu-item"),
        {
          matchValue: (el) => el.getAttribute("data-context-menu-item"),
          stop: (el) => el.hasAttribute("data-context-menu"),
        }
      );

      if (itemId != null) {
        const selected = itemsToRender.findIndex((i: any) => i.id == itemId);
        if (selected !== -1 && state.selected != selected) {
          setState({
            ...state,
            selected,
          });
        }
      }
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

    const menu = menuRef.current;

    wrapper.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("click", listenForClose);
    menu?.addEventListener("mouseover", updateSelected);
    return () => {
      wrapper.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("clicK", listenForClose);
      menu?.removeEventListener("mouseover", updateSelected);
    };
  }, [state.active, itemsToRender]);

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
