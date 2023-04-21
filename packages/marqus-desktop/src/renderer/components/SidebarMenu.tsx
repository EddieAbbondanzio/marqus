import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { PromisedInput } from "../../shared/promisedInput";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";
import { isBlank } from "../../shared/utils";
import { Store } from "../store";
import { px2, py1, THEME, w100 } from "../css";
import { Focusable, wasInsideFocusable } from "./shared/Focusable";
import { Icon, IconProps } from "./shared/Icon";
import { MouseDrag, useMouseDrag } from "../io/mouse";
import { Section } from "../../shared/ui/app";
import { partial } from "lodash";
import { getClosestAttribute } from "../utils/dom";
import { createPortal } from "react-dom";
import { math } from "polished";

export const SIDEBAR_MENU_ATTRIBUTE = "data-nav-menu";

// Keep in sync with actual height + padding set in StyledRow / StyledFocusable
// lower down in this file.
export const SIDEBAR_MENU_HEIGHT = "3.4rem";
const INDENT_WIDTH = "10px";
const ICON_WIDTH = "20px";
const ICON_SIZE: IconProps["size"] = "lg";
const FONT_SIZE = "1.2rem";

interface SidebarMenuProps {
  icon?: IconDefinition;
  depth: number;
  id: string;
  title?: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
  onIconClick: (ev: React.MouseEvent) => void;
  onDrag: (newParent?: string) => void;
  store: Store;
}

export function SidebarMenu(props: SidebarMenuProps): JSX.Element {
  const {
    id,
    title,
    value,
    depth,
    icon,
    isSelected,
    onClick,
    onIconClick,
    onDrag,
    store,
  } = props;
  const { state } = store;

  const menuRef = useRef<HTMLAnchorElement>(null!);

  const [cursorEl, setCursorEl] = useState<JSX.Element | undefined>();
  const cursorElRef = useRef<HTMLDivElement | null>(null);
  const { width, scrollToNoteId } = store.state.sidebar;

  const onDragHandler = useCallback(
    (drag: MouseDrag | null) => {
      if (!drag || drag.state === "dragCancelled") {
        setCursorEl(undefined);
        return;
      }

      const { clientX: mouseX, clientY: mouseY } = drag.event;
      if (drag.state === "dragging") {
        const el = cursorElRef.current;
        if (el) {
          const [offsetX, offsetY] = drag.initialOffset;

          el.style.left = `${mouseX - offsetX}px`;
          el.style.top = `${mouseY - offsetY}px`;
        }
      } else if (drag.state === "dragStarted") {
        setCursorEl(
          <CursorFollower ref={cursorElRef} style={{ width }}>
            <SidebarRow depth={depth} hasIcon={Boolean(icon)} state="selected">
              {icon && (
                <StyledMenuIcon
                  icon={icon}
                  size={ICON_SIZE}
                  onClick={onIconClick}
                />
              )}
              <StyledMenuText>{value}</StyledMenuText>
            </SidebarRow>
          </CursorFollower>,
        );
      } else if (drag.state === "dragEnded") {
        const newParent = getSidebarMenuAttribute(
          drag.event.target as HTMLElement,
        );

        if (newParent != null) {
          onDrag(newParent);
        }
        // Drag was inside sidebar, but not on a note. Move note to root.
        else if (wasInsideFocusable(drag.event, Section.Sidebar)) {
          onDrag();
        }

        // Drags that end outside of the sidebar should be considered cancels.

        setCursorEl(undefined);
      }
    },
    [icon, depth, value, width, onIconClick, onDrag],
  );

  useMouseDrag(menuRef, onDragHandler, {
    cursor: "grabbing",
    disabled: state.sidebar.input != null,
  });

  // Scroll to menu if it matches the scrollToNoteId
  useEffect(() => {
    if (scrollToNoteId != null && scrollToNoteId === id) {
      $(menuRef.current!.parentElement!).scrollTo(menuRef.current!, 0);
    }
  }, [scrollToNoteId, id]);

  return (
    <>
      <SidebarRow
        state={isSelected ? "selected" : undefined}
        ref={menuRef}
        title={title}
        depth={depth}
        hasIcon={Boolean(icon)}
        onClick={onClick}
        {...{ [SIDEBAR_MENU_ATTRIBUTE]: id }}
      >
        {icon && (
          <StyledMenuIcon
            icon={icon}
            size={ICON_SIZE}
            onClick={ev => props.onIconClick(ev)}
          />
        )}
        <StyledMenuText>{value}</StyledMenuText>
      </SidebarRow>
      {createPortal(cursorEl, document.body)}
    </>
  );
}

const CursorFollower = styled.div`
  position: absolute;
  pointer-events: none;
`;

// Keep in sync with StyledFocusable
const SidebarRow = styled.a<{
  state?: "selected" | "hovered";
  depth: number;
  hasIcon?: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 3rem;
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
  padding-left: ${p => getPaddingLeft(p.depth, p.hasIcon)};

  ${p => {
    switch (p.state) {
      case "selected":
        return `background-color: ${THEME.sidebar.selected};`;

      case "hovered":
        return `background-color: ${THEME.sidebar.hover};`;

      default:
        return `
        background-color: ${THEME.sidebar.background};
        &:hover {
          background-color: ${THEME.sidebar.hover};
        }
        `;
    }
  }}
`;

const StyledMenuIcon = styled(Icon)`
  color: ${THEME.sidebar.icon};
  width: ${ICON_WIDTH};
  height: 1.6rem;
  padding: 0;
  margin: 0;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  text-align: center;
  font-size: ${FONT_SIZE};
  flex-shrink: 0;
`;

const StyledMenuText = styled.div`
  color: ${THEME.sidebar.font};
  font-size: ${FONT_SIZE};
  font-weight: bold;

  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export interface SidebarInputProps {
  store: Store;
  value: PromisedInput;
  depth: number;
  icon?: IconDefinition;
  isSelected: boolean;
}

export function SidebarInput(props: SidebarInputProps): JSX.Element {
  const {
    store,
    depth,
    icon,
    isSelected,
    value: { confirm, cancel, value },
  } = props;

  const inputRef = useRef(null! as HTMLInputElement);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [isValid, setIsValid] = useState(true);

  const tryConfirm = () => {
    if (isValid) {
      confirm();
    }
  };

  const onBlur = () => {
    if (isBlank(value)) {
      cancel();
    } else {
      confirm();
    }
  };

  const onChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { validate, onChange: setChanges } = props.value;
    const { value } = ev.target;

    // Apply validation if needed
    if (validate != null) {
      const validateOutcome = validate(value);
      if (!validateOutcome.valid) {
        setErrorMessage(validateOutcome.errors[0]);
      } else {
        setErrorMessage(undefined);
      }
      setIsValid(validateOutcome.valid);
    }

    setChanges(value);
  };

  const keyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    // Swallow event to avoid triggering shortcuts
    ev.stopPropagation();

    const key = parseKeyCode(ev.code);
    switch (key) {
      case KeyCode.Enter:
        return tryConfirm();
      case KeyCode.Escape:
        return cancel();
    }
  };

  // On first render, scroll the input into view.
  useEffect(() => {
    $(inputRef.current!.parentElement!).scrollTo(inputRef.current!, 0);
  }, []);

  return (
    <>
      <StyledFocusable
        state={isSelected ? "selected" : "hovered"}
        depth={depth}
        hasIcon={Boolean(icon)}
        store={store}
        section={Section.SidebarInput}
        elementRef={inputRef}
        onBlur={onBlur}
      >
        {icon && <StyledMenuIcon icon={icon} size={ICON_SIZE} />}
        <StyledInput
          ref={inputRef}
          value={value}
          onChange={onChange}
          onKeyDown={keyDown}
          data-testid="sidebar-input"
        />
      </StyledFocusable>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </>
  );
}

// Keep in sync with SidebarRow
const StyledFocusable = styled(Focusable)<{
  state: "selected" | "hovered";
  depth: number;
  hasIcon?: boolean;
}>`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  align-items: center;
  height: 3rem;
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
  padding-left: ${p => getPaddingLeft(p.depth, p.hasIcon)};
  ${p => {
    switch (p.state) {
      case "selected":
        return `background-color: ${THEME.sidebar.selected};`;

      case "hovered":
        return `background-color: ${THEME.sidebar.hover};`;

      default:
        return `
        background-color: ${THEME.sidebar.background};
        &:hover {
          background-color: ${THEME.sidebar.hover};
        }
        `;
    }
  }};
`;

const StyledInput = styled.input`
  ${w100};
  border: none;
  outline: none;
  -webkit-appearance: none;
  height: 2rem;
  font-size: ${FONT_SIZE};
  font-weight: bold;
  padding-left: 0;
  background-color: inherit;
  color: ${THEME.sidebar.input.font};
  ${py1};
`;

const ErrorMessage = styled.div`
  background-color: ${THEME.sidebar.error.background};
  color: ${THEME.sidebar.error.font};
  font-size: ${FONT_SIZE};
  font-weight: bold;
  position: relative;
  height: ${SIDEBAR_MENU_HEIGHT};
  display: flex;
  flex-direction: row;
  align-items: center;
  ${px2}
`;

export const getSidebarMenuAttribute = partial(
  getClosestAttribute,
  SIDEBAR_MENU_ATTRIBUTE,
);

export function getPaddingLeft(depth: number, hasIcon?: boolean): string {
  if (depth < 0) {
    throw new Error("Depth must be 0 or greater.");
  }

  let iconOffset = "0px";
  if (!hasIcon) {
    iconOffset = math(`${ICON_WIDTH} + 5px`);
  }

  return math(`${depth} * ${INDENT_WIDTH} + ${iconOffset}`);
}
