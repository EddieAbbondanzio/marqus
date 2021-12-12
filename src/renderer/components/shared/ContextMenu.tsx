import { clamp } from "lodash";
import React, {
  SetStateAction,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { PropsWithChildren } from "react";
import { classList } from "../../../shared/dom";
import { getNodeEnv } from "../../../shared/env";
import { KeyCode } from "../../../shared/io/keyCode";
import { State } from "../../../shared/state";
import { Execute } from "../../io/commands";
import { CommandInput, CommandType } from "../../io/commands/types";
import { useFocus } from "../../io/focus";
import { useKeyboard } from "../../io/keyboard";
import { useMouse } from "../../io/mouse";

export const GLOBAL_CONTEXT_ITEMS: JSX.Element[] = [];
if (getNodeEnv() === "development") {
  GLOBAL_CONTEXT_ITEMS.push(
    <ContextMenuDivider key="devDivider" />,
    <ContextMenuItem text="Reload" command="app.reload" key="reload" />,
    <ContextMenuItem
      text="Open Dev Tools"
      command="app.openDevTools"
      key="openDevTools"
    />
  );
}

export interface ContextMenuProps {
  name: string;
  state: State;
  execute: Execute;
  items: (target?: HTMLElement) => JSX.Element[];
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
      onClick={() => ctx.execute(props.command, props.commandInput)}
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
  commandParam?: any;
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

  const [items, setItems] = useState([...GLOBAL_CONTEXT_ITEMS]);

  const { focus } = useFocus(menuRef, false);
  if (state.active) {
    focus();
  }

  useMouse(wrapperRef).listen({ event: "click", button: "right" }, (ev) => {
    ev.stopPropagation();
    const { clientX: left, clientY: top } = ev;

    let active = !state.active;

    let generatedItems = state.generatedItems ?? false;
    if (active) {
      if (!generatedItems) {
        const target = ev.target as HTMLElement;
        setItems([...props.items(target), ...GLOBAL_CONTEXT_ITEMS]);
      }
    } else {
      setItems([...GLOBAL_CONTEXT_ITEMS]);
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
  });
  useMouse(window).listen({ event: "click" }, () => {
    if (state.active) {
      setState({
        ...state,
        active: false,
      });
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
            props.execute(state.selected.command, state.selected.commandParam);
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

    setState({
      ...state,
      selected: { command, index },
    });
  };

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
                execute: props.execute,
                setSelected,
              }}
            >
              {items}
            </ContextMenuContext.Provider>
          </div>
        </div>
      )}
      {props.children}
    </div>
  );
}
