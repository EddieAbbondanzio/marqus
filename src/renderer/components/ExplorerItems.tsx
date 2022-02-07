import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PropsWithChildren } from "react";
import { classList, percentage, px } from "../../shared/dom";
import { InvalidOpError } from "../../shared/errors";
import { KeyCode } from "../../shared/io/keyCode";
import { isBlank } from "../../shared/string";
import { useKeyboard } from "../io/keyboard";
import { BulmaSize } from "../shared";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";
import * as yup from "yup";

export const NAV_MENU_HEIGHT = 30;
// Keep consistent with icon width in index.sass
export const NAV_MENU_INDENT = 16;
export const NAV_MENU_ATTRIBUTE = "data-nav-menu";
export const COLLAPSED_ICON = faCaretRight;
export const EXPANDED_ICON = faCaretDown;

export interface ExplorerMenuProps {
  id: string;
  icon?: IconDefinition;
  text: string;
  collapsed?: boolean;
  selected?: boolean;
  onClick?: () => any;
  expanded?: boolean;
  depth: number;
}

export function ExplorerMenu(props: PropsWithChildren<ExplorerMenuProps>) {
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

  const onClick = (ev: React.MouseEvent<HTMLElement>) => {
    // Support nested nav menus
    ev.stopPropagation();
    props.onClick?.();
  };

  // Override icon to expanded / collapsed if we have children
  let icon = props.icon;
  if (props.children != null) {
    icon = props.expanded ? EXPANDED_ICON : COLLAPSED_ICON;
  }

  return (
    <div
      className={wrapperClasses}
      onClick={onClick}
      {...{ [NAV_MENU_ATTRIBUTE]: props.id }}
    >
      <a
        className={triggerClasses}
        style={{
          height: px(30),
          paddingLeft: calculateIndent(props.depth),
        }}
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

export interface ExplorerInputProps {
  name: string;
  className?: string;
  value: string;
  onInput: (value: string) => void;
  confirm: () => void;
  cancel: () => void;
  schema?: yup.StringSchema;
  size?: BulmaSize;
  depth: number;
}

export function ExplorerInput(props: ExplorerInputProps): JSX.Element {
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
    if (flags.wasFinalized || errorMessage.length > 0 || !(await validate())) {
      return;
    }

    if (!isBlank(input.current.value)) {
      console.log("confirm");
      props.confirm();
    } else {
      console.log("cancel");
      props.cancel();
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

  // const stopProp = (ev: FocusEvent) => ev.stopPropagation();

  useEffect(() => {
    const { current: el } = input;
    el.setCustomValidity(errorMessage);

    el.addEventListener("blur", onBlur);
    // el.addEventListener("focusin", stopProp);
    return () => {
      el.removeEventListener("blur", onBlur);
      // el.removeEventListener("focusin", stopProp);
    };
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

  const classes = classList(
    "input",
    props.size as string | undefined,
    props.className
  );

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
        name={props.name}
        onFocus={() => input.current?.focus()}
        blurOnEscape={true}
      >
        <input
          ref={input}
          className={classes}
          onInput={onInput}
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
