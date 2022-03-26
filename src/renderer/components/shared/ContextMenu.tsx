import React, { useEffect, useRef, useState } from "react";
import { PropsWithChildren } from "react";
import { MouseButton, useMouse } from "../../io/mouse";
import { findParent } from "../../utils/findParent";
import { Focusable } from "./Focusable";
import { EventType, EventValue, Store } from "../../store";
import { Section } from "../../../shared/domain/state";
import { isDevelopment } from "../../../shared/env";
import styled from "styled-components";
import { px2, py1, THEME } from "../../css";
import { findNext, findPrevious } from "../../../shared/utils";

// These will appear at the bottom of the menu
export const GLOBAL_CONTEXT_ITEMS: ContextMenuItems = (ev?: MouseEvent) => {
  const items: ContextMenuItem[] = [];

  if (isDevelopment()) {
    items.push(
      { role: "divider" },
      {
        role: "entry",
        text: "Reload",
        event: "app.reload",
      },
      {
        role: "entry",
        text: "Open Dev Tools",
        event: "app.openDevTools",
      }
    );

    if (ev != null) {
      const { clientX: x, clientY: y } = ev;
      items.push({
        role: "entry",
        text: "Inspect Element",
        event: "app.inspectElement",
        eventInput: { x, y },
      });
    }
  }

  return items;
};

export interface ContextMenuProps {
  store: Store;
  name: Section;
  items: ContextMenuItems;
}

export type ContextMenuItems = (ev?: MouseEvent) => ContextMenuItem[];

export interface ContextMenuPosition {
  top: number;
  left: number;
}

export type ContextMenuItem = ContextMenuEntry | ContextMenuDivider;
interface ContextMenuEntry<EType extends EventType = EventType> {
  role: "entry";
  text: string;
  event: EType;
  eventInput?: EventValue<EType>;
  shortcut?: string;
}
interface ContextMenuDivider {
  role: "divider";
}

export function ContextMenu(props: PropsWithChildren<ContextMenuProps>) {
  const wrapperRef = useRef(null! as HTMLDivElement);
  const [position, setPosition] = useState<ContextMenuPosition | undefined>();
  const [items, setItems] = useState([] as ContextMenuItem[]);
  const [selected, setSelected] = useState<ContextMenuEntry | undefined>();
  const [lastMoused, setLastMoused] = useState<ContextMenuEntry | undefined>();

  // Listen for when to display the menu
  useMouse(wrapperRef).listen("click", { button: MouseButton.Right }, (ev) => {
    const { clientX: left, clientY: top } = ev;

    if (position != null) {
      return;
    }

    setPosition({
      top,
      left,
    });
    setItems([...props.items(ev), ...GLOBAL_CONTEXT_ITEMS(ev)]);
    setSelected(undefined);
    setLastMoused(undefined);
    props.store.dispatch("focus.push", "contextMenu");
  });

  // Listen for external click to blur menu
  useMouse(window).listen("click", (ev) => {
    if (position != null) {
      const menu = findParent(ev.target as HTMLElement, (el) =>
        el.classList.contains("context-menu")
      );

      if (!menu) {
        setPosition(undefined);
        props.store.dispatch("focus.pop");
      }
    }
  });

  const dispatchAndHide = async <EType extends EventType>(
    event: EType,
    input?: EventValue<EType>
  ) => {
    // Band-aid cast
    props.store.dispatch<EType>(event, input as any);
    setPosition(undefined);
  };

  useEffect(() => {
    const { store } = props;
    const moveSelectionUp = () => {
      // Start at the bottom if we don't have a selection
      let currIndex = items.length;
      if (selected != null) {
        currIndex = items.findIndex(
          (item) => item.role === "entry" && item.event === selected.event
        );
      }

      const nextSelected = findPrevious(
        items,
        currIndex,
        (item) => item.role === "entry"
      ) as ContextMenuEntry;
      if (nextSelected != null) {
        setSelected(nextSelected);
        setLastMoused(undefined);
      }
    };

    const moveSelectionDown = () => {
      // Start at top if we don't have a selection
      let currIndex = -1;
      if (selected != null) {
        currIndex = items.findIndex(
          (item) => item.role === "entry" && item.event === selected.event
        );
      }

      const nextSelected = findNext(
        items,
        currIndex,
        (item) => item.role === "entry"
      ) as ContextMenuEntry;
      if (nextSelected != null) {
        setSelected(nextSelected);
        setLastMoused(undefined);
      }
    };

    const blur = () => {
      store.dispatch("focus.pop");
      if (position != null) {
        setPosition(undefined);
      }
    };
    const run = () => {
      if (selected != null) {
        props.store.dispatch(selected.event, selected.eventInput);
        setPosition(undefined);
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
  }, [props.store.state, setPosition, position, items, selected, lastMoused]);

  const setSelectedIfDifferent = (item?: ContextMenuEntry) => {
    if (item != null && lastMoused != null && lastMoused === item) {
      return;
    }

    if (selected != item) {
      setSelected(item);
      setLastMoused(item);
    }
  };

  return (
    <Wrapper ref={wrapperRef} data-context-menu={props.name}>
      {position != null && (
        <Focusable store={props.store} name={props.name}>
          <StyledMenu style={position}>
            {items.map((item, i) => {
              if (item.role === "divider") {
                return <StyledDivider key={i} />;
              } else {
                if (selected != null && item.event === selected.event) {
                  return (
                    <StyledSelectedEntry
                      key={i}
                      onClick={() =>
                        dispatchAndHide(item.event, item.eventInput)
                      }
                    >
                      {item.text}
                    </StyledSelectedEntry>
                  );
                } else {
                  return (
                    <StyledEntry
                      key={i}
                      onClick={() =>
                        dispatchAndHide(item.event, item.eventInput)
                      }
                      onMouseMove={() => setSelectedIfDifferent(item)}
                    >
                      {item.text}
                    </StyledEntry>
                  );
                }
              }
            })}
          </StyledMenu>
        </Focusable>
      )}
      {props.children}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
`;

const StyledMenu = styled.div.attrs({
  tabIndex: -1,
  // Used to check if a click was inside the menu or not.
  className: "context-menu",
})` 
  border: 1px solid ${THEME.contextMenu.border};
  background-color: ${THEME.contextMenu.background};
  position: absolute;
  zindex: 1;
`;

const StyledDivider = styled.div`
  border-bottom: 1px solid ${THEME.contextMenu.border};
`;

const StyledEntry = styled.div`
  display: flex;
  align-items: center;
  ${px2}
  ${py1}
`;

const StyledSelectedEntry = styled(StyledEntry)`
  background-color: ${THEME.contextMenu.highlight};
`;
