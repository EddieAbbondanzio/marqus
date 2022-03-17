import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PropsWithChildren } from "react";
import { classList, percentage, px } from "../../shared/dom";
import { InvalidOpError } from "../../shared/errors";
import { KeyCode } from "../../shared/io/keyCode";
import { useKeyboard } from "../io/keyboard";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";
import * as yup from "yup";
import { MouseButton, useMouse } from "../io/mouse";
import { isBlank } from "../../shared/utils";
import { Store } from "../store";

export const NAV_MENU_HEIGHT = 30;
// Keep consistent with icon width in index.sass
export const NAV_MENU_INDENT = 16;
export const NAV_MENU_ATTRIBUTE = "data-nav-menu";
export const COLLAPSED_ICON = faCaretRight;
export const EXPANDED_ICON = faCaretDown;

export interface SidebarMenuProps {
  id: string;
  icon?: IconDefinition;
  text: string;
  collapsed?: boolean;
  selected?: boolean;
  onClick?: (button: MouseButton) => any;
  expanded?: boolean;
  depth: number;
}

export function SidebarMenu(props: PropsWithChildren<SidebarMenuProps>) {
  const triggerClasses = classList(
    "nav-menu-trigger",
    "is-flex",
    "is-align-items-center",
    "has-background-primary-hover",
    { "has-background-primary": props.selected }
  );
  const wrapperClasses = classList(
    "nav-menu",
    "is-flex",
    "is-justify-content-center",
    "is-flex-direction-column"
  );

  // Override icon to expanded / collapsed if we have children
  let icon = props.icon;
  if (props.children != null) {
    icon = props.expanded ? EXPANDED_ICON : COLLAPSED_ICON;
  }

  const triggerRef = useRef(null! as HTMLAnchorElement);
  useMouse(triggerRef).listen(
    { event: "click", button: MouseButton.Left | MouseButton.Right },
    (ev, button) => {
      ev.stopPropagation();
      props.onClick?.(button);
    }
  );

  return (
    <div className={wrapperClasses} {...{ [NAV_MENU_ATTRIBUTE]: props.id }}>
      <a
        className={triggerClasses}
        style={{
          height: px(30),
          paddingLeft: calculateIndent(props.depth),
        }}
        ref={triggerRef}
      >
        <div className="is-flex is-flex-row is-align-items-center has-text-dark is-size-7 w-100">
          {icon != null && <Icon icon={icon} />}
          <span>{props.text}</span>
        </div>
      </a>
      {props.expanded && props.children}
    </div>
  );
}

export interface SidebarInputProps {
  store: Store;
  className?: string;
  initialValue: string;
  value: string;
  onInput: (value: string) => void;
  confirm: () => void;
  cancel: () => void;
  schema?: yup.StringSchema;
  size?: string;
  depth: number;
}

export function SidebarInput(props: SidebarInputProps): JSX.Element {
  const [flags, setFlags] = useState({
    wasFinalized: false,
    wasTouched: false,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const input = useRef(null! as HTMLInputElement);

  const validate = async () => {
    if (props.schema == null) {
      return true;
    }

    try {
      await props.schema.validate(props.value);
      setErrorMessage("");
      return true;
    } catch (error) {
      setErrorMessage((error as yup.ValidationError).errors[0]);
      return false;
    }
  };

  if (flags.wasTouched) {
    validate();
  }

  const onBlur = async () => {
    const { value } = input.current;

    // If it was empty and the user blurred we assume they didn't want to save
    // their changes.
    if (isBlank(value)) {
      props.cancel();
      return;
    }

    if (flags.wasFinalized || errorMessage.length > 0 || !(await validate())) {
      return;
    }

    // Don't bother confirming input if nothing was changed
    if (value !== props.initialValue) {
      props.confirm();
    }

    setFlags({ ...flags, wasFinalized: true });
  };

  const onInput = async (ev: FormEvent<HTMLInputElement>) => {
    if (flags.wasFinalized) {
      return;
    }

    const value = (ev.target as HTMLInputElement).value as string;
    props.onInput(value.trim());
    setFlags({ ...flags, wasTouched: true });
  };

  useEffect(() => {
    const { current: el } = input;
    el.setCustomValidity(errorMessage);
  });

  const keyboard = useKeyboard(input);
  keyboard.listen(
    { event: "keydown", keys: [KeyCode.Enter, KeyCode.Escape] },
    async (_, key) => {
      if (flags.wasFinalized) {
        return;
      }

      switch (key) {
        case KeyCode.Enter:
          const isValid = await validate();
          if (!isValid) {
            return;
          }
          props.confirm();
          break;

        case KeyCode.Escape:
          props.cancel();
          break;

        default:
          throw new InvalidOpError(`Invalid key of ${key}`);
      }

      setFlags({ ...flags, wasFinalized: true });
    }
  );

  const inputClasses = classList(
    "input",
    props.size as string | undefined,
    props.className
  );

  const onFocus = () => {
    input.current.focus();
  };

  return (
    <div
      className="inline-input field mb-0"
      style={{
        position: "relative",
        height: px(30),
        paddingLeft: calculateIndent(props.depth),
      }}
    >
      <Focusable
        store={props.store}
        name="sidebarInput"
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <input
          ref={input}
          className={inputClasses}
          // We listen for onChange so we can support backspace
          onChange={onInput}
          value={props.value}
        ></input>
        {errorMessage.length > 0 && (
          <p
            className="help is-danger box m-0 p-2"
            style={{ position: "absolute", width: percentage(100) }}
          >
            {errorMessage}
          </p>
        )}
      </Focusable>
    </div>
  );
}

export function calculateIndent(depth: number) {
  return px(depth * NAV_MENU_INDENT);
}
