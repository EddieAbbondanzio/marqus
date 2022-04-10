import React, { useEffect, useRef, useState } from "react";
import { PropsWithChildren } from "react";
import { findParent } from "../../utils/findParent";
import { Focusable } from "./Focusable";
import { EventType, EventValue, Store } from "../../store";
import { isDevelopment } from "../../../shared/env";
import styled from "styled-components";
import { px2, py1, THEME } from "../../css";
import { findNext, findPrevious } from "../../../shared/utils";
import { Coord } from "../../utils/dom";

/*
 * Electron has a built in context menu but we rolled our own so we could tie
 * it into our contextual shortcut system better. Plus we can re-use font
 * awesome icons on it.
 */

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
  items: ContextMenuItems;
}

export type ContextMenuItems = (ev?: MouseEvent) => ContextMenuItem[];

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

export function ContextMenu(
  props: PropsWithChildren<ContextMenuProps>
): JSX.Element {
  const wrapperRef = useRef(null! as HTMLDivElement);
  const [position, setPosition] = useState<Coord | undefined>();
  const [items, setItems] = useState([] as ContextMenuItem[]);
  const [selected, setSelected] = useState<ContextMenuEntry | undefined>();
  const [lastMoused, setLastMoused] = useState<ContextMenuEntry | undefined>();

  useEffect(() => {
    const show = (ev: MouseEvent) => {
      if (position != null) {
        return;
      }
      setPosition({
        x: ev.clientX,
        y: ev.clientY,
      });
      setItems([...props.items(ev), ...GLOBAL_CONTEXT_ITEMS(ev)]);
      setSelected(undefined);
      setLastMoused(undefined);
      props.store.dispatch("focus.push", "contextMenu");
    };

    const hide = (ev: MouseEvent) => {
      if (position != null) {
        const menu = findParent(ev.target as HTMLElement, (el) =>
          el.classList.contains("context-menu")
        );

        if (!menu) {
          setPosition(undefined);
          props.store.dispatch("focus.pop");
        }
      }
    };

    const { current: el } = wrapperRef;
    el.addEventListener("contextmenu", show);
    window.addEventListener("click", hide);

    return () => {
      el.removeEventListener("contextmenu", show);
      window.removeEventListener("click", hide);
    };
  }, [wrapperRef, position, props]);

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
  }, [props, setPosition, position, items, selected, lastMoused]);

  const setSelectedIfDifferent = (item?: ContextMenuEntry) => {
    if (item != null && lastMoused != null && lastMoused === item) {
      return;
    }

    if (selected != item) {
      setSelected(item);
      setLastMoused(item);
    }
  };

  const dispatchAndHide = async (item: ContextMenuEntry) => {
    props.store.dispatch(item.event, item.eventInput);
    setPosition(undefined);
  };

  return (
    <Wrapper ref={wrapperRef}>
      {position != null && (
        <Focusable store={props.store} name="contextMenu">
          <StyledMenu style={{ left: position.x, top: position.y }}>
            {items.map((item, i) => {
              if (item.role === "divider") {
                return <StyledDivider key={i} />;
              } else {
                if (selected != null && item.event === selected.event) {
                  return (
                    <StyledSelectedEntry
                      key={i}
                      onClick={() => dispatchAndHide(item)}
                    >
                      {item.text}
                    </StyledSelectedEntry>
                  );
                } else {
                  return (
                    <StyledEntry
                      key={i}
                      onClick={() => dispatchAndHide(item)}
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
