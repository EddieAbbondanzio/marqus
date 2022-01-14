import { clamp } from "lodash";
import React, {
  SetStateAction,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { PropsWithChildren } from "react";
import { classList, Coord } from "../../../shared/dom";
import { getNodeEnv } from "../../../shared/env";
import { KeyCode } from "../../../shared/io/keyCode";
import { State } from "../../../shared/domain/state";
import { Execute } from "../../io/commands";
import { CommandInput, CommandType, SetUI } from "../../io/commands/types";
import { useFocus } from "../../io/focus";
import { useKeyboard } from "../../io/keyboard";
import { MouseModifier, useMouse } from "../../io/mouse";
import { findParent } from "../../utils/findParent";
import { Focusable } from "../Focusable";

export const GLOBAL_CONTEXT_ITEMS = (ev?: MouseEvent) => {
  const items = [];

  if (getNodeEnv() === "development") {
    items.push(
      <ContextMenuDivider key="devDivider" />,
      <ContextMenuItem text="Reload" command="app.reload" key="reload" />,
      <ContextMenuItem
        text="Open Dev Tools"
        command="app.openDevTools"
        key="openDevTools"
      />
    );

    if (ev != null) {
      const { clientX: x, clientY: y } = ev;
      items.push(
        <ContextMenuItem
          text="Inspect Element"
          command="app.inspectElement"
          commandInput={{ x, y }}
          key="inspectElement"
        />
      );
    }
  }

  return items;
};

export interface ContextMenuProps {
  name: string;
  state: State;
  execute: Execute;
  setUI: SetUI;
  items: (ev?: MouseEvent) => JSX.Element[];
}

export interface ContextMenuItemProps<C extends CommandType> {
  text: string;
  command: C;
  commandInput?: CommandInput<C>;
  selected?: boolean;
  shortcut?: string;
}

export function ContextMenuItem<C extends CommandType>(
  props: ContextMenuItemProps<C>
) {
  const ctx = useContext(ContextMenuContext);

  const classes = classList(
    "px-2",
    "py-1",
    "is-flex",
    "is-justify-content-space-between",
    "is-align-items-center",
    ctx.selected?.command === props.command
      ? "has-background-primary"
      : undefined
  );

  const ref = useRef(null! as HTMLDivElement);
  useMouse(ref).listen({ event: "mouseOver" }, () => {
    if (!props.selected) {
      ctx.setSelected(props.command);
    }
  });

  return (
    <div
      ref={ref}
      onClick={(ev) => ctx.execute(props.command, props.commandInput)}
      className={classes}
      key={props.text}
    >
      <span>{props.text}</span>
      <span className="is-size-7 is-uppercase has-text-grey pl-2">
        {props.shortcut}
      </span>
    </div>
  );
}

export function ContextMenuDivider() {
  return <hr className="m-0" />;
}

export interface ContextMenuSelected {
  command: CommandType;
  commandInput?: CommandInput<CommandType>;
  index: number;
}

export interface ContextMenuState {
  active: boolean;
  selected?: ContextMenuSelected;
  top?: number;
  left?: number;
  generatedItems?: boolean;
}

const ContextMenuContext = React.createContext<{
  selected?: { command: string; index: number };
  execute: Execute;
  setSelected: (command: CommandType) => void;
}>({} as any);

export function ContextMenu(props: PropsWithChildren<ContextMenuProps>) {
  const wrapperRef = useRef(null! as HTMLDivElement);
  const menuRef = useRef(null! as HTMLDivElement);

  const [state, setState] = useState<ContextMenuState>({
    active: false,
  });

  const [items, setItems] = useState([] as JSX.Element[]);

  const { focus } = useFocus(menuRef, false);

  useMouse(wrapperRef).listen(
    { event: "click", button: "right", modifier: MouseModifier.Alt },
    (ev) => {
      ev.stopPropagation();
      const { clientX: left, clientY: top } = ev;

      let active = !state.active;

      let generatedItems = state.generatedItems ?? false;
      if (active) {
        if (!generatedItems) {
          setItems([...props.items(ev), ...GLOBAL_CONTEXT_ITEMS(ev)]);
        }
      } else {
        setItems([...GLOBAL_CONTEXT_ITEMS()]);
        generatedItems = false;
      }

      setState({
        ...state,
        top,
        left,
        // Toggle allows closing menu with the same button that opened it.
        active,
        selected: active ? undefined : state.selected,
        generatedItems,
      });

      if (active) {
        focus();
      }
    }
  );

  // Listen for external click to blur menu
  useMouse(window).listen({ event: "click" }, (ev) => {
    if (state.active) {
      const menu = findParent(ev.target as HTMLElement, (el) =>
        el.classList.contains("context-menu")
      );

      if (!menu) {
        setState({
          ...state,
          active: false,
        });
        props.setUI((s) => ({
          focused: [s.focused?.[1]!],
        }));
      }
    }
  });

  const calculateNextSelected = (
    items: JSX.Element[],
    s: ContextMenuState,
    dir: "up" | "down"
  ): ContextMenuState => {
    let index: number = s.selected?.index ?? undefined!;
    if (dir === "up") {
      index = (s.selected?.index ?? items.length) - 1;

      while (index > 0 && items[index].type != ContextMenuItem) {
        index--;
      }
    } else {
      index = (s.selected?.index ?? -1) + 1;

      while (index < items.length - 1 && items[index].type != ContextMenuItem) {
        index++;
      }
    }

    index = clamp(index, 0, items.length - 1);
    const { command, commandParam } = items[index].props;
    const selected = {
      index,
      command,
      commandParam,
    };

    return {
      ...s,
      selected,
    };
  };

  useKeyboard(menuRef).listen(
    {
      event: "keydown",
      keys: [KeyCode.Escape, KeyCode.Enter, KeyCode.ArrowUp, KeyCode.ArrowDown],
    },
    async (_, key) => {
      if (!state.active) {
        return;
      }

      switch (key) {
        case KeyCode.Enter:
          if (state.selected != null) {
            props.execute(state.selected.command, state.selected.commandInput);

            setState({
              active: false,
            });
          }
          break;

        case KeyCode.Escape:
          setState({
            active: false,
          });
          break;

        case KeyCode.ArrowUp:
          setState((s) => calculateNextSelected(items, s, "up"));
          break;

        case KeyCode.ArrowDown:
          setState((s) => calculateNextSelected(items, s, "down"));
          break;
      }
    }
  );

  const setSelected = (command: CommandType) => {
    const index = items.findIndex((i) => {
      return i.props.command === command;
    });

    if (index == -1) {
      console.error(
        `Could not find item for command ${command} current items: `,
        items
      );
      throw Error(`Could not find item for command ${command}`);
    }

    const { commandInput } = items[index].props;
    setState({
      ...state,
      selected: {
        command,
        index,
        commandInput,
      },
    });
  };

  const execute: Execute = async (command, input) => {
    props.execute(command, input);
    setState({
      ...state,
      active: false,
    });
  };

  return (
    <div
      ref={wrapperRef}
      className="is-flex is-flex-direction-column is-flex-grow-1"
      data-context-menu={props.name}
    >
      {state.active && (
        <Focusable name="sidebarContextMenu">
          <div
            ref={menuRef}
            className="context-menu box m-0 p-0"
            style={{
              position: "absolute",
              zIndex: 1,
              top: state.top,
              left: state.left,
            }}
            tabIndex={-1}
          >
            <div>
              <ContextMenuContext.Provider
                value={{
                  selected: state.selected,
                  execute,
                  setSelected,
                }}
              >
                {items}
              </ContextMenuContext.Provider>
            </div>
          </div>
        </Focusable>
      )}
      {props.children}
    </div>
  );
}
