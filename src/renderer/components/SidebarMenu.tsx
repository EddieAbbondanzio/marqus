import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import OpenColor from "open-color";
import React, { useRef, useState } from "react";
import styled from "styled-components";
import { PromisedInput } from "../../shared/awaitableInput";
import { px } from "../../shared/dom";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";
import { isBlank } from "../../shared/utils";
import { Store } from "../store";
import { mt1, p1, pr1, py1, THEME } from "../styling";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";

export const SIDEBAR_MENU_ATTRIBUTE = "data-nav-menu";
export const SIDEBAR_MENU_HEIGHT = 24;
export const SIDEBAR_MENU_INDENT = 12;

export type SidebarMenuProps = SidebarMenuInput | SidebarMenuText;
interface BaseProps {
  icon: IconDefinition;
  depth: number;
}
interface SidebarMenuInput extends BaseProps {
  store: Store;
  value: PromisedInput;
}
interface SidebarMenuText extends BaseProps {
  id: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
}

export function SidebarMenu(props: SidebarMenuProps) {
  const paddingLeft = px(props.depth * SIDEBAR_MENU_INDENT);
  const { value, icon } = props;
  let content;
  if (typeof props.value === "string") {
    content = (
      <StyledMenuText {...{ [SIDEBAR_MENU_ATTRIBUTE]: (props as any).id }}>
        {props.value}
      </StyledMenuText>
    );
  } else {
    content = (
      <SidebarInput
        store={(props as any).store}
        key="sidebarInput"
        awaitableInput={value as PromisedInput}
      />
    );
  }

  // TODO: Really fix this. It's sloppy.
  if ((props as any).isSelected) {
    return (
      <SelectedMenu style={{ paddingLeft }} onClick={(props as any).onClick}>
        <StyledMenuIcon icon={icon} size="xs" />
        {content}
      </SelectedMenu>
    );
  } else {
    return (
      <StyledMenu style={{ paddingLeft }} onClick={(props as any).onClick}>
        <StyledMenuIcon icon={icon} size="xs" />
        {content}
      </StyledMenu>
    );
  }
}

// TODO: Fix this.
const SelectedMenu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${SIDEBAR_MENU_HEIGHT}px;
  background-color: ${THEME.sidebar.selected};
`;

const StyledMenu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${SIDEBAR_MENU_HEIGHT}px;
`;

const StyledMenuIcon = styled(Icon)`
  color: ${THEME.sidebar.font};
  width: ${SIDEBAR_MENU_INDENT}px;
  text-align: center;
`;

const StyledMenuText = styled.div`
  color: ${THEME.sidebar.font};
  font-size: 0.8rem;
`;

export interface SidebarInputProps {
  store: Store;
  awaitableInput: PromisedInput;
}

export function SidebarInput(props: SidebarInputProps) {
  const inputRef = useRef(null! as HTMLInputElement);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [isValid, setIsValid] = useState(true);

  const { cancel } = props.awaitableInput;
  const tryConfirm = () => {
    if (isValid) {
      props.awaitableInput.confirm();
    }
  };

  const onBlur = () => {
    if (isBlank(props.awaitableInput.value)) {
      cancel();
    } else {
      props.awaitableInput.confirm();
    }
  };

  const onChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { validate, onChange: setChanges } = props.awaitableInput;
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
    <StyledFocusable
      store={props.store}
      name="sidebarInput"
      onFocus={() => inputRef.current?.focus()}
      onBlur={onBlur}
    >
      <StyledInput
        ref={inputRef}
        value={props.awaitableInput.value}
        onChange={onChange}
        onKeyDown={keyDown}
      />

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </StyledFocusable>
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
