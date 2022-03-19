import OpenColor from "open-color";
import React, { useRef, useState } from "react";
import styled from "styled-components";
import { PromisedInput } from "../../shared/awaitableInput";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";
import { isBlank } from "../../shared/utils";
import { Store } from "../store";
import { mt1, p1, py1 } from "../styling";
import { Focusable } from "./shared/Focusable";

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
