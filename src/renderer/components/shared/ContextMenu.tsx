import { clamp } from "lodash";
import React, {
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PropsWithChildren } from "react";
import { classList, Coord } from "../../../shared/dom";
import { MouseButton, useMouse } from "../../io/mouse";
import { findParent } from "../../utils/findParent";
import { Focusable } from "./Focusable";
import { Dispatch, EventType, EventValue, Store } from "../../store";
import { Section } from "../../../shared/domain/state";
import { isDevelopment } from "../../../shared/env";

export const GLOBAL_CONTEXT_ITEMS = (ev?: MouseEvent) => {
  const items = [];

  if (isDevelopment()) {
    items.push(
      <ContextMenuDivider key="devDivider" />,
      <ContextMenuItem text="Reload" event="app.reload" key="reload" />,
      <ContextMenuItem
        text="Open Dev Tools"
        event="app.openDevTools"
        key="openDevTools"
      />
    );

    if (ev != null) {
      const { clientX: x, clientY: y } = ev;
      items.push(
        <ContextMenuItem
          text="Inspect Element"
          event="app.inspectElement"
          eventInput={{ x, y }}
          key="inspectElement"
        />
      );
    }
  }

  return items;
};

export interface ContextMenuProps {
  store: Store;
  name: Section;
  items: (ev?: MouseEvent) => JSX.Element[];
}

export interface ContextMenuItemProps<EType extends EventType> {
  text: string;
  event: EType;
  eventInput?: EventValue<EType>;
  selected?: boolean;
  shortcut?: string;
}

export function ContextMenuItem<E extends EventType>(
  props: ContextMenuItemProps<E>
) {
  const ctx = useContext(ContextMenuContext);

  const classes = classList(
    "px-2",
    "py-1",
    "is-flex",
    "is-justify-content-space-between",
    "is-align-items-center",
    ctx.selected?.event === props.event ? "has-background-primary" : undefined
  );

  const ref = useRef(null! as HTMLDivElement);
  useMouse(ref).listen({ event: "mouseOver" }, () => {
    if (!props.selected) {
      ctx.setSelected(props.event);
    }
  });

  return (
    <div
      ref={ref}
      onClick={() => ctx.dispatch(props.event, props.eventInput as any)}
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
  event: EventType;
  eventInput?: EventValue<EventType>;
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
  selected?: { event: string; index: number };
  dispatch: Dispatch;
  setSelected: (event: EventType) => void;
}>({} as any);

export function ContextMenu(props: PropsWithChildren<ContextMenuProps>) {
  const wrapperRef = useRef(null! as HTMLDivElement);
  const menuRef = useRef(null! as HTMLDivElement);

  const [state, setState] = useState<ContextMenuState>({
    active: false,
  });

  const [items, setItems] = useState([] as JSX.Element[]);
  // const ctx = useContext(FocusContext);
  useMouse(wrapperRef).listen(
    { event: "click", button: MouseButton.Right },
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
        props.store.dispatch("focus.push", "contextMenu");
        // ctx.push("contextMenu");
      }
    }
  );

  // Listen for external click to blur menu
  useMouse(window).listen(
    { event: "click", button: MouseButton.Left },
    (ev) => {
      if (state.active) {
        const menu = findParent(ev.target as HTMLElement, (el) =>
          el.classList.contains("context-menu")
        );

        if (!menu) {
          setState({
            ...state,
            active: false,
          });

          props.store.dispatch("focus.pop");
        }
      }
    }
  );

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
    const { event, eventInput }: Omit<ContextMenuSelected, "index"> =
      items[index].props;
    const selected = {
      index,
      event,
      eventInput,
    };

    return {
      ...s,
      selected,
    };
  };

  const setSelected = (event: EventType) => {
    const index = items.findIndex((i) => {
      return i.props.event === event;
    });

    if (index == -1) {
      console.error(
        `Could not find context menuitem for event ${event} current items: `,
        items
      );
      throw Error(`Could not find context menu item for event ${event}`);
    }

    const { eventInput } = items[index].props;
    setState({
      ...state,
      selected: {
        event,
        index,
        eventInput,
      },
    });
  };

  const dispatch: Dispatch = async (event, input: any) => {
    props.store.dispatch(event, input as any);
    setState({
      ...state,
      active: false,
    });
  };

  useEffect(() => {
    const { store } = props;
    const moveSelectionUp = () =>
      setState((s) => calculateNextSelected(items, s, "up"));
    const moveSelectionDown = () =>
      setState((s) => calculateNextSelected(items, s, "down"));
    const blur = () => {
      store.dispatch("focus.pop");
      if (state.active) {
        setState({
          ...state,
          active: false,
        });
      }
    };
    const run = () => {
      if (state.selected != null) {
        props.store.dispatch(state.selected.event, state.selected.eventInput);

        setState({
          active: false,
        });
      }
    };

    store.on("contextMenu.moveSelectionDown", moveSelectionDown);
    store.on("contextMenu.moveSelectionUp", moveSelectionUp);
    store.on("contextMenu.blur", blur);
    store.on("contextMenu.run", run);

    return () => {
      store.off("contextMenu.moveSelectionDown", moveSelectionDown);
      store.off("contextMenu.moveSelectionUp", moveSelectionUp);
      store.off("contextMenu.blur", blur);
      store.off("contextMenu.run", run);
    };
  }, [props.store.state, setState, state.selected]);

  return (
    <div
      ref={wrapperRef}
      className="is-flex is-flex-direction-column is-flex-grow-1"
      data-context-menu={props.name}
    >
      {state.active && (
        <Focusable store={props.store} name={props.name}>
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
                  dispatch,
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
