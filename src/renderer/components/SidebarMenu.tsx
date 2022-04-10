import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import OpenColor from "open-color";
import React, { useRef, useState } from "react";
import styled from "styled-components";
import { PromisedInput } from "../../shared/awaitableInput";
import { px } from "../utils/dom";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";
import { isBlank } from "../../shared/utils";
import { Store } from "../store";
import { mt1, p1, py1, THEME } from "../css";
import { Focusable, wasInsideFocusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";
import { useMouseDrag } from "../io/mouse";
import { findParent } from "../utils/findParent";

export const SIDEBAR_MENU_ATTRIBUTE = "data-nav-menu";
export const SIDEBAR_MENU_HEIGHT = 24;
export const SIDEBAR_MENU_INDENT = 10;
export const SIDEBAR_ICON_WIDTH = 20;

interface SidebarMenuProps {
  icon?: IconDefinition;
  depth: number;
  id: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
  onIconClick: (ev: React.MouseEvent) => void;
  onDrag: (newParent?: string) => void;
}

export function SidebarMenu(props: SidebarMenuProps): JSX.Element {
  const paddingLeft = px(props.depth * SIDEBAR_MENU_INDENT);
  const { value, icon, isSelected, onClick } = props;

  let backgroundColor;
  if (isSelected) {
    backgroundColor = THEME.sidebar.selected;
  }

  const menuRef = useRef<HTMLAnchorElement>(null);
  useMouseDrag(
    menuRef,
    (drag) => {
      if (drag?.state === "dragEnded") {
        const newParent = getSidebarMenuAttribute(
          drag.event.target as HTMLElement
        );
        if (newParent != null) {
          props.onDrag(newParent);
        } else if (wasInsideFocusable(drag.event, "sidebar")) {
          props.onDrag();
        }
      }
    },
    { cursor: "grabbing" }
  );

  return (
    <StyledMenu
      ref={menuRef}
      style={{ paddingLeft, backgroundColor }}
      onClick={onClick}
      {...{ [SIDEBAR_MENU_ATTRIBUTE]: props.id }}
    >
      {icon && (
        <StyledMenuIcon
          icon={icon}
          size="xs"
          onClick={(ev) => props.onIconClick(ev)}
        />
      )}
      <StyledMenuText style={{ paddingLeft: !icon ? "20px" : undefined }}>
        {value}
      </StyledMenuText>
    </StyledMenu>
  );
}

const StyledMenu = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${SIDEBAR_MENU_HEIGHT}px;
  &:hover {
    background-color: ${THEME.sidebar.hover};
  }
`;

const StyledMenuIcon = styled(Icon)`
  color: ${THEME.sidebar.font};
  width: ${SIDEBAR_ICON_WIDTH}px;
  padding: 0;
  text-align: center;
`;

const StyledMenuText = styled.div`
  color: ${THEME.sidebar.font};
  font-size: 0.8rem;
`;

export interface SidebarInputProps {
  store: Store;
  value: PromisedInput;
  icon?: IconDefinition;
  depth: number;
}

export function SidebarInput(props: SidebarInputProps): JSX.Element {
  const paddingLeft = px(
    props.depth * SIDEBAR_MENU_INDENT + SIDEBAR_ICON_WIDTH
  );
  const inputRef = useRef(null! as HTMLInputElement);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [isValid, setIsValid] = useState(true);

  const { cancel } = props.value;
  const tryConfirm = () => {
    if (isValid) {
      props.value.confirm();
    }
  };

  const onBlur = () => {
    if (isBlank(props.value.value)) {
      cancel();
    } else {
      props.value.confirm();
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
    const key = parseKeyCode(ev.code);
    switch (key) {
      case KeyCode.Enter:
        return tryConfirm();
      case KeyCode.Escape:
        return cancel();
    }
  };

  return (
    <div style={{ paddingLeft }}>
      <StyledFocusable
        store={props.store}
        name="sidebarInput"
        onFocus={() => inputRef.current?.focus()}
        onBlur={onBlur}
      >
        <StyledInput
          ref={inputRef}
          value={props.value.value}
          onChange={onChange}
          onKeyDown={keyDown}
        />

        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </StyledFocusable>
    </div>
  );
}

const StyledFocusable = styled(Focusable)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

// Keep height consistent with sidebar item
const StyledInput = styled.input`
  border: none;
  height: 16px;
  ${py1}
`;

// Sampled: https://www.florin-pop.com/blog/2019/05/pure-css-tooltip/
const ErrorMessage = styled.div`
  background-color: ${OpenColor.red[1]};
  color: ${OpenColor.red[9]};
  font-size: 0.8rem;
  border-radius: 4px;
  position: relative;
  ${mt1}
  ${p1}
`;

export function getSidebarMenuAttribute(element: HTMLElement): string | null {
  return findParent(element, (el) => el.hasAttribute(SIDEBAR_MENU_ATTRIBUTE), {
    matchValue: (el) => el.getAttribute(SIDEBAR_MENU_ATTRIBUTE),
  });
}
